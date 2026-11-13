-- The two "article sent for admin approval" notification templates were
-- worded in the first person ("Seu artigo..." — "YOUR article...") even
-- though they're sent to every admin, not to the author — so an admin had
-- no way to tell whose article it was without opening it. Adds an
-- {{author}} placeholder and rewrites both rows (including any admin
-- customization already saved) to use it.
update notification_templates
  set title_template = '"{{title}}" de {{author}} foi enviado para aprovação',
      description = 'Enviada a todos os admins quando um autor manda a matéria pra aprovação pela primeira vez. Placeholders: {{title}}, {{author}}.',
      updated_at = now()
  where key = 'article_submitted_for_approval';

update notification_templates
  set title_template = '"{{title}}" de {{author}} foi revisado e reenviado para aprovação',
      description = 'Enviada a todos os admins quando um autor reenvia a matéria depois de alterações pedidas. Placeholders: {{title}}, {{author}}.',
      updated_at = now()
  where key = 'article_resubmitted_for_approval';
