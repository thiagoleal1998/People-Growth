// Pure text helpers shared by the server (src/lib/notify.ts, rendering the
// real notification) and the client (NotificationTemplatesManager.tsx's
// live preview while editing) — no Supabase/server imports here, so this
// is safe for a "use client" component to pull in directly.

export type NotificationTemplateKey =
  | "article_published"
  | "article_approved_scheduled"
  | "article_changes_requested"
  | "ticket_member_notified"
  | "article_submitted_for_approval"
  | "article_resubmitted_for_approval"
  | "instruction_item_created"
  | "message_received";

export function renderTemplateText(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, key: string) => vars[key] ?? "");
}

// Who actually receives each notification — derived from the call sites in
// src/lib/notify.ts's callers (notifyColumnist in admin/artigos/actions.ts,
// notifyAdmins in colunista/artigos/actions.ts, the instruction-item and
// ticket/message flows) — used purely to group the admin's template editor
// visually; it has no effect on which row actually gets notified.
export type NotificationAudience = "colunista" | "admin" | "ambos";

export const NOTIFICATION_TEMPLATE_AUDIENCE: Record<NotificationTemplateKey, NotificationAudience> = {
  article_published: "colunista",
  article_approved_scheduled: "colunista",
  article_changes_requested: "colunista",
  ticket_member_notified: "ambos",
  article_submitted_for_approval: "admin",
  article_resubmitted_for_approval: "admin",
  instruction_item_created: "colunista",
  message_received: "ambos",
};

// Not real data — just plausible stand-ins so the admin's live preview
// shows filled-in text instead of literal "{{title}}" while editing.
export const NOTIFICATION_TEMPLATE_PREVIEW_VARS: Record<NotificationTemplateKey, Record<string, string>> = {
  article_published: { title: "Como a liderança remota mudou em 2026" },
  article_approved_scheduled: { title: "Como a liderança remota mudou em 2026", scheduled_for: "05/11/2026, 09:00" },
  article_changes_requested: { title: "Como a liderança remota mudou em 2026", feedback: "Ajuste o título do segundo parágrafo, está repetitivo." },
  ticket_member_notified: { ticket_code: "CPG-0023", ticket_title: "Erro ao salvar matéria" },
  article_submitted_for_approval: { title: "Como a liderança remota mudou em 2026", author: "Gustavo Monken" },
  article_resubmitted_for_approval: { title: "Como a liderança remota mudou em 2026", author: "Gustavo Monken" },
  instruction_item_created: { title: "Como enviar uma pauta para aprovação" },
  message_received: { sender: "Gustavo Monken", preview: "Oi, dúvida rápida sobre essa instrução..." },
};
