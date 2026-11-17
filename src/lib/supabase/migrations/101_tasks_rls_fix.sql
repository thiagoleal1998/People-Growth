-- Corrige um bug de RLS descoberto na verificação de 100_tasks.sql: ao
-- criar uma tarefa, a Server Action faz `insert().select()`, e o Postgres
-- reavalia a policy de SELECT sobre o RETURNING. current_user_can_see_task()
-- faz uma sub-consulta recursiva em "tasks" para checar o criador — essa
-- sub-consulta não enxerga a linha recém-inserida dentro do mesmo statement
-- (só não quebrava pra admin porque o primeiro ramo do OR, current_user_role()
-- = 'admin', já resolve antes de precisar da sub-consulta). A correção troca
-- as policies de SELECT/UPDATE de "tasks" por uma checagem direta nas
-- colunas da própria linha (created_by) em vez de uma sub-consulta na mesma
-- tabela — current_user_can_see_task() continua sendo usada sem problema nas
-- outras tabelas (task_assignees, task_checklist_items, task_comments), que
-- nunca sofrem desse self-reference.
BEGIN;

DROP POLICY "See tasks you created or are assigned to" ON tasks;
CREATE POLICY "See tasks you created or are assigned to" ON tasks FOR SELECT USING (
  current_user_role() = 'admin'
  OR created_by = auth.uid()
  OR EXISTS (SELECT 1 FROM task_assignees WHERE task_assignees.task_id = tasks.id AND task_assignees.user_profile_id = auth.uid())
);

DROP POLICY "Update tasks you created or are assigned to" ON tasks;
CREATE POLICY "Update tasks you created or are assigned to" ON tasks FOR UPDATE USING (
  current_user_role() = 'admin'
  OR created_by = auth.uid()
  OR EXISTS (SELECT 1 FROM task_assignees WHERE task_assignees.task_id = tasks.id AND task_assignees.user_profile_id = auth.uid())
);

COMMIT;
