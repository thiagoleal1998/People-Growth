import { createAdminClient } from "@/lib/supabase/server";
import { sendPushToUser } from "@/lib/push";
import { renderTemplateText, type NotificationTemplateKey } from "@/lib/notification-template-text";

export type { NotificationTemplateKey };

// Falls back here if notification_templates is ever missing a row (migration
// not run yet, or a key typo) — same text that used to be hardcoded at each
// call site, so behavior never silently breaks.
export const DEFAULT_TEMPLATES: Record<NotificationTemplateKey, { title: string; body: string | null }> = {
  article_published: { title: '"{{title}}" foi publicado', body: null },
  article_approved_scheduled: { title: '"{{title}}" foi aprovado e agendado', body: "Vai ao ar em {{scheduled_for}}." },
  article_changes_requested: { title: 'Alterações solicitadas em "{{title}}"', body: "{{feedback}}" },
  ticket_member_notified: { title: "Você foi notificado no chamado {{ticket_code}}", body: "{{ticket_title}}" },
  article_submitted_for_approval: { title: '"{{title}}" de {{author}} foi enviado para aprovação', body: null },
  article_resubmitted_for_approval: { title: '"{{title}}" de {{author}} foi revisado e reenviado para aprovação', body: null },
  instruction_item_created: { title: 'Nova instrução: "{{title}}"', body: "Confira no Canal de Instruções." },
  message_received: { title: "{{sender}} te enviou uma mensagem", body: "{{preview}}" },
};

export async function renderNotificationTemplate(
  key: NotificationTemplateKey,
  vars: Record<string, string>
): Promise<{ title: string; body: string | null }> {
  const admin = await createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin as any).from("notification_templates").select("title_template, body_template").eq("key", key).single();
  const template = data ? { title: data.title_template, body: data.body_template } : DEFAULT_TEMPLATES[key];
  return {
    title: renderTemplateText(template.title, vars),
    body: template.body ? renderTemplateText(template.body, vars) : null,
  };
}

// The one place every notification goes through — renders the admin-
// editable (or default) wording, drops it in the recipient's bell, and
// best-effort fires a browser push to every device they've opted into (a
// no-op until VAPID_PRIVATE_KEY is configured, see src/lib/push.ts).
// `client` is whichever Supabase client the caller already has on hand —
// the admin's own session (RLS allows admins to insert for anyone) or the
// service-role client (e.g. a columnist notifying every admin, who have no
// insert policy of their own).
export async function insertNotification(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any,
  userId: string,
  key: NotificationTemplateKey,
  vars: Record<string, string>,
  link: string
): Promise<void> {
  const { title, body } = await renderNotificationTemplate(key, vars);
  await client.from("notifications").insert({ user_id: userId, title, body, link });
  await sendPushToUser(userId, { title, body, link });
}
