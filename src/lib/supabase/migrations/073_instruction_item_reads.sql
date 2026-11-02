-- Read tracking for instruction_items — same shape and purpose as
-- announcement_reads (migration 053): lets the columnist sidebar show an
-- unread badge on "Canal de Instruções", and the instructions page
-- silently mark everything read on visit, same pattern already used for
-- Comunicados.
create table instruction_item_reads (
  instruction_item_id uuid not null references instruction_items(id) on delete cascade,
  user_id uuid not null references user_profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (instruction_item_id, user_id)
);

alter table instruction_item_reads enable row level security;

-- Same 3-policy split as announcement_reads: a user can see/insert only
-- their own read receipts (auth.uid() itself, never a client-supplied
-- user id), admins get full access on top.
create policy "Users can read their own instruction_item_reads" on instruction_item_reads for select
  using (user_id = auth.uid());
create policy "Users can mark instructions read for themselves" on instruction_item_reads for insert
  with check (user_id = auth.uid());
create policy "Admins have full access to instruction_item_reads" on instruction_item_reads for all
  using (current_user_role() = 'admin');

-- New notification template: admin creates a new instruction -> every
-- columnist gets a bell/push notification (src/lib/notify.ts renders this,
-- editable from /admin/configuracoes same as the other templates).
insert into notification_templates (key, title_template, body_template, description) values
  ('instruction_item_created', 'Nova instrução: "{{title}}"', 'Confira no Canal de Instruções.',
    'Enviada a todos os colunistas quando o admin cadastra uma nova instrução, etapa ou pergunta de FAQ. Placeholders: {{title}}.');
