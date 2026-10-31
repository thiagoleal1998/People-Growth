-- Admin-editable wording for every in-app notification the site sends
-- (to authors and to admins) — see src/lib/notify.ts, which renders these
-- with {{placeholder}} substitution and falls back to its own hardcoded
-- DEFAULT_TEMPLATES if a row is ever missing. Seeded with the exact text
-- that was previously hardcoded at each call site, so nothing changes
-- until an admin edits one from /admin/configuracoes.
create table notification_templates (
  key text primary key,
  title_template text not null,
  body_template text,
  description text,
  updated_at timestamptz not null default now()
);

alter table notification_templates enable row level security;

create policy "Admins have full access to notification_templates"
  on notification_templates for all
  using (current_user_role() = 'admin');

insert into notification_templates (key, title_template, body_template, description) values
  ('article_published', '"{{title}}" foi publicado', null,
    'Enviada ao autor quando o admin publica a matéria direto. Placeholders: {{title}}.'),
  ('article_approved_scheduled', '"{{title}}" foi aprovado e agendado', 'Vai ao ar em {{scheduled_for}}.',
    'Enviada ao autor quando o admin aprova e agenda a matéria. Placeholders: {{title}}, {{scheduled_for}}.'),
  ('article_changes_requested', 'Alterações solicitadas em "{{title}}"', '{{feedback}}',
    'Enviada ao autor quando o admin pede alterações. {{feedback}} é o texto livre digitado pelo admin na hora — não tire esse placeholder do corpo.'),
  ('ticket_member_notified', 'Você foi notificado no chamado {{ticket_code}}', '{{ticket_title}}',
    'Enviada a quem é marcado num chamado interno ("Notificar membro"). Placeholders: {{ticket_code}}, {{ticket_title}}.'),
  ('article_submitted_for_approval', '"{{title}}" foi enviado para aprovação', null,
    'Enviada a todos os admins quando um autor manda a matéria pra aprovação pela primeira vez. Placeholders: {{title}}.'),
  ('article_resubmitted_for_approval', '"{{title}}" foi revisado e reenviado para aprovação', null,
    'Enviada a todos os admins quando um autor reenvia a matéria depois de alterações pedidas. Placeholders: {{title}}.');
