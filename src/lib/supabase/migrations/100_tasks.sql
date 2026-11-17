-- Kanban de tarefas compartilhado entre /admin e /equipe. Regra central:
-- admin vê tudo; uma pessoa da equipe só vê um card depois de ser
-- adicionada nele (current_user_can_see_task(), abaixo) — ou se foi
-- ela quem criou o card.
BEGIN;

CREATE TABLE task_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id UUID NOT NULL REFERENCES task_columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta')),
  due_date DATE,
  created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE task_assignees (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (task_id, user_profile_id)
);

CREATE TABLE task_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Same SECURITY DEFINER shape as current_user_role()/current_user_is_founder()
-- (088_finance.sql) — reused by every task_* table's policies below so the
-- "can I see this task" rule lives in one place.
CREATE OR REPLACE FUNCTION public.current_user_can_see_task(task_id_param UUID) RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT
    current_user_role() = 'admin'
    OR EXISTS (SELECT 1 FROM tasks WHERE id = task_id_param AND created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM task_assignees WHERE task_id = task_id_param AND user_profile_id = auth.uid());
$$;

ALTER TABLE task_columns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin and equipe can read columns" ON task_columns FOR SELECT USING (current_user_role() IN ('admin', 'equipe'));
CREATE POLICY "Only admin manages columns" ON task_columns FOR INSERT WITH CHECK (current_user_role() = 'admin');
CREATE POLICY "Only admin updates columns" ON task_columns FOR UPDATE USING (current_user_role() = 'admin');
CREATE POLICY "Only admin deletes columns" ON task_columns FOR DELETE USING (current_user_role() = 'admin');

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "See tasks you created or are assigned to" ON tasks FOR SELECT USING (current_user_can_see_task(id));
CREATE POLICY "Admin and equipe can create tasks" ON tasks FOR INSERT WITH CHECK (current_user_role() IN ('admin', 'equipe') AND created_by = auth.uid());
CREATE POLICY "Update tasks you created or are assigned to" ON tasks FOR UPDATE USING (current_user_can_see_task(id));
-- Narrower than the other operations on purpose: anyone merely added to a
-- card shouldn't be able to delete someone else's task out from under them.
CREATE POLICY "Only admin or the creator deletes a task" ON tasks FOR DELETE USING (current_user_role() = 'admin' OR created_by = auth.uid());

ALTER TABLE task_assignees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manage assignees of tasks you can see" ON task_assignees FOR ALL USING (current_user_can_see_task(task_id)) WITH CHECK (current_user_can_see_task(task_id));

ALTER TABLE task_checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Manage checklist of tasks you can see" ON task_checklist_items FOR ALL USING (current_user_can_see_task(task_id)) WITH CHECK (current_user_can_see_task(task_id));

ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read and post comments on tasks you can see" ON task_comments FOR SELECT USING (current_user_can_see_task(task_id));
CREATE POLICY "Post comments on tasks you can see" ON task_comments FOR INSERT WITH CHECK (current_user_can_see_task(task_id) AND author_id = auth.uid());
CREATE POLICY "Only the author or admin edits a comment" ON task_comments FOR UPDATE USING (current_user_role() = 'admin' OR author_id = auth.uid());
CREATE POLICY "Only the author or admin deletes a comment" ON task_comments FOR DELETE USING (current_user_role() = 'admin' OR author_id = auth.uid());

INSERT INTO task_columns (label, "order") VALUES ('A fazer', 0), ('Em andamento', 1), ('Concluído', 2);

COMMIT;
