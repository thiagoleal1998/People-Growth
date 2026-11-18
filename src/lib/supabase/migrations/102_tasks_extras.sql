-- Três ajustes pedidos depois do uso real do Kanban de Tarefas (100/101):
-- numeração sequencial do card, notificação de card novo na Equipe, e
-- anexos (imagem ou arquivo) por card.
BEGIN;

-- Numeração sequencial exibida como "CGF-0000 | <ano>" — mesmo padrão de
-- ticket_number/formatTicketId (035_ticket_and_user_display_ids.sql).
ALTER TABLE tasks ADD COLUMN task_number SERIAL;

-- NULL = a pessoa ainda não abriu esse card desde que foi
-- adicionada/criou — vira a contagem da bolinha vermelha no painel de
-- Equipe. Contagem exata (não diff), mesmo padrão de messages.read_at.
ALTER TABLE task_assignees ADD COLUMN seen_at TIMESTAMPTZ;

CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  content_type TEXT,
  uploaded_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;

-- Seguro usar current_user_can_see_task aqui (diferente do bug corrigido
-- em 101_tasks_rls_fix.sql): task_attachments nunca reconsulta a si mesma
-- dentro do mesmo statement de INSERT/RETURNING, igual task_comments e
-- task_checklist_items, que já usam esse mesmo helper sem problema.
CREATE POLICY "Manage attachments of tasks you can see" ON task_attachments
  FOR ALL USING (current_user_can_see_task(task_id)) WITH CHECK (current_user_can_see_task(task_id));

COMMIT;
