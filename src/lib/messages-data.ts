import type { Message } from "@/types/database.types";
import type { ConversationSummary, MessageRecipient } from "@/components/MessagesClient";

// Read-side helpers for the messaging feature — shared by admin/mensagens,
// colunista/mensagens and the instructions-channel creator lookup, since
// all three need the same "resolve a user_profiles row into a display
// name + role label" logic (mirrors resolveActorName in auth/profile.ts,
// batched for several ids at once instead of one).
//
// user_profiles' only SELECT policy is "auth.uid() = id" (migration 010) —
// a session client can only ever see the caller's OWN row. Every lookup
// here needs OTHER people's rows (the recipient list, a conversation
// partner's name), so these all take the admin client, same bypass
// reasoning CLAUDE.md documents for /admin/usuarios. This is directory
// data only (name/role/email), never message content, and callers control
// exactly which rows get queried (e.g. onlyRole below), so it can't be
// used to leak anything beyond "who exists and what they're called".

type ProfileLite = { id: string; email: string; role: string; columnist_id: string | null };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function resolveProfiles(adminClient: any, profiles: ProfileLite[]): Promise<MessageRecipient[]> {
  const columnistIds = profiles.map((p) => p.columnist_id).filter((id): id is string => !!id);
  const columnistMap = new Map<string, { name: string; role_pt: string | null }>();
  if (columnistIds.length > 0) {
    const { data } = await adminClient.from("columnists").select("id,name,role_pt").in("id", columnistIds);
    for (const row of (data ?? []) as { id: string; name: string; role_pt: string | null }[]) {
      columnistMap.set(row.id, { name: row.name, role_pt: row.role_pt });
    }
  }
  return profiles.map((p) => {
    const columnist = p.columnist_id ? columnistMap.get(p.columnist_id) : undefined;
    const role = (p.role === "admin" ? "admin" : "columnist") as "admin" | "columnist";
    const fallbackLabel = role === "admin" ? "Administrador" : "Colunista";
    return {
      id: p.id,
      name: columnist?.name || p.email,
      role,
      roleLabel: columnist?.role_pt?.trim() || fallbackLabel,
    };
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function listMessageRecipients(adminClient: any, selfId: string, onlyRole?: "admin"): Promise<MessageRecipient[]> {
  let query = adminClient.from("user_profiles").select("id,email,role,columnist_id").neq("id", selfId);
  if (onlyRole) query = query.eq("role", onlyRole);
  const { data } = await query;
  return resolveProfiles(adminClient, (data ?? []) as ProfileLite[]);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function resolveUsersByIds(adminClient: any, ids: string[]): Promise<Map<string, MessageRecipient>> {
  if (ids.length === 0) return new Map();
  const { data } = await adminClient.from("user_profiles").select("id,email,role,columnist_id").in("id", ids);
  const resolved = await resolveProfiles(adminClient, (data ?? []) as ProfileLite[]);
  return new Map(resolved.map((r) => [r.id, r]));
}

// sessionClient reads `messages` (RLS-scoped to the caller's own rows, as
// it should be); adminClient resolves the other-party names (see above).
export async function buildConversationSummaries(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sessionClient: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adminClient: any,
  selfId: string
): Promise<ConversationSummary[]> {
  const { data } = await sessionClient
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${selfId},recipient_id.eq.${selfId}`)
    .order("created_at", { ascending: false })
    .limit(300);
  const rows = (data ?? []) as Message[];

  const byOther = new Map<string, { last: Message; unread: number }>();
  for (const m of rows) {
    const otherId = m.sender_id === selfId ? m.recipient_id : m.sender_id;
    const isUnreadForMe = m.recipient_id === selfId && !m.read_at;
    const entry = byOther.get(otherId);
    if (!entry) {
      byOther.set(otherId, { last: m, unread: isUnreadForMe ? 1 : 0 });
    } else if (isUnreadForMe) {
      entry.unread += 1;
    }
  }

  const otherIds = [...byOther.keys()];
  const resolved = await resolveUsersByIds(adminClient, otherIds);
  return otherIds
    .map((id) => {
      const entry = byOther.get(id)!;
      const user = resolved.get(id);
      return {
        otherId: id,
        otherName: user?.name ?? "—",
        otherRoleLabel: user?.roleLabel ?? "",
        lastBody: entry.last.body,
        lastAt: entry.last.created_at,
        unread: entry.unread,
      };
    })
    .sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1));
}
