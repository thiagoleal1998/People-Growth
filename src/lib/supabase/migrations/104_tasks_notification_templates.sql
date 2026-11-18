-- Wording editável pro admin das duas notificações novas de Tarefas: ser
-- adicionado como solicitado num card, e um comentário novo num card em
-- que a pessoa participa (criadora ou solicitada) — nunca um broadcast
-- geral, só os participantes daquele card. Mesmo padrão de seed incremental
-- já usado em 074_messages.sql pra message_received.
INSERT INTO notification_templates (key, title_template, body_template, description) VALUES
  ('task_assigned', '{{assigner}} te adicionou numa tarefa', '{{task_code}} — "{{title}}"',
    'Enviada a quem é adicionado como solicitado num card de Tarefas. Placeholders: {{assigner}}, {{task_code}}, {{title}}.'),
  ('task_comment_added', '{{author}} comentou em {{task_code}}', '{{preview}}',
    'Enviada aos participantes de um card (criador e solicitados) quando alguém comenta — nunca a quem não participa do card. Placeholders: {{author}}, {{task_code}}, {{title}}, {{preview}}.');
