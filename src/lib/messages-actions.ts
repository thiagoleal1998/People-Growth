"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getCurrentProfile, resolveActorName } from "@/lib/auth/profile";
import { insertNotification } from "@/lib/notify";

// Shared by both /admin/mensagens and /colunista/mensagens — the business
// rule (who can message whom) is identical on both sides, only the allowed-
// recipient list differs (computed in each panel's own page.tsx), so unlike
// the Article/AuthorArticleForm pair there's nothing panel-specific to keep
// in sync here.

export async function sendMessage(input: {
  recipientId: string;
  recipientRole: "admin" | "columnist";
  body: string;
  audioUrl?: string;
  contextType?: string;
  contextId?: string;
  contextTitle?: string;
}): Promise<{ error?: string }> {
  const body = input.body.trim();
  if (!body && !input.audioUrl) return { error: "Mensagem vazia." };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Não autenticado." };

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const { error } = await client.from("messages").insert({
    sender_id: profile.id,
    recipient_id: input.recipientId,
    body,
    audio_url: input.audioUrl ?? null,
    context_type: input.contextType ?? null,
    context_id: input.contextId ?? null,
    context_title: input.contextTitle ?? null,
  });
  if (error) return { error: error.message };

  const senderName = await resolveActorName(profile);
  const adminClient = await createAdminClient();
  const link = (input.recipientRole === "admin" ? "/admin" : "/colunista") + `/mensagens?with=${profile.id}`;
  const preview = body ? body.slice(0, 80) : "🎤 Mensagem de voz";
  await insertNotification(adminClient, input.recipientId, "message_received", { sender: senderName, preview }, link);

  return {};
}

export async function markThreadRead(otherUserId: string): Promise<void> {
  const profile = await getCurrentProfile();
  if (!profile) return;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;
  await client
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", profile.id)
    .eq("sender_id", otherUserId)
    .is("read_at", null);
}
