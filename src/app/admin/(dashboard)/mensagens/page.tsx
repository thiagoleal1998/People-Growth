import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/profile";
import { listMessageRecipients, buildConversationSummaries } from "@/lib/messages-data";
import { MessagesClient } from "@/components/MessagesClient";
import { PageHeader } from "@/components/admin/ui";

export default async function AdminMensagensPage({ searchParams }: { searchParams: Promise<{ with?: string; about?: string }> }) {
  const { with: withId, about: aboutId } = await searchParams;
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const client = supabase as any;

  const [recipients, conversations] = await Promise.all([
    listMessageRecipients(client, profile.id),
    buildConversationSummaries(client, profile.id),
  ]);

  const validWith = withId && recipients.some((r) => r.id === withId) ? withId : undefined;
  let initialContext: { type: string; id: string; title: string } | undefined;
  if (validWith && aboutId) {
    const { data: item } = await client.from("instruction_items").select("title").eq("id", aboutId).single();
    if (item?.title) initialContext = { type: "instruction_item", id: aboutId, title: item.title };
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <PageHeader title="Mensagens" subtitle="Converse com outros administradores e colunistas." />
      <div style={{ flex: 1, minHeight: 0 }}>
        <MessagesClient
          currentUserId={profile.id}
          recipients={recipients}
          initialConversations={conversations}
          initialWith={validWith}
          initialContext={initialContext}
        />
      </div>
    </div>
  );
}
