-- Dá à Equipe acesso ao Calendário de Divulgação, que até aqui era
-- admin-only. Mesmo esquema de leitura/escrita que admin já tinha (não é
-- um escopo "só meus itens" — é um calendário de equipe, todo mundo vê e
-- edita os mesmos itens). As "pautas de matéria" que o calendário também
-- exibe (tabela articles, não content_calendar_items) já se auto-limitam
-- à própria pessoa pela RLS existente de articles (columnist_id =
-- current_user_columnist_id()), sem precisar de nada novo aqui.
DROP POLICY "Admins have full access to content_calendar_items" ON content_calendar_items;
CREATE POLICY "Admin and equipe have full access to content_calendar_items" ON content_calendar_items FOR ALL
  USING (current_user_role() IN ('admin', 'equipe'));
