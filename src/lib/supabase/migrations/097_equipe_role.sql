-- Third login role: "equipe" — for staff with a formal cargo in "Cargos e
-- Funções" (role_profiles) who aren't founders. Gets its own panel at
-- /equipe, with the exact same self-service rights a columnist already
-- has (articles, comments, tickets, messages, profile) plus read access
-- to their own role_profiles/career_plans row. See src/proxy.ts and
-- src/app/equipe/ for the app-side half of this.
BEGIN;

ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_role_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check CHECK (role IN ('admin', 'columnist', 'equipe'));

ALTER TABLE internal_tickets DROP CONSTRAINT internal_tickets_created_by_role_check;
ALTER TABLE internal_tickets ADD CONSTRAINT internal_tickets_created_by_role_check CHECK (created_by_role IN ('admin', 'columnist', 'equipe'));

ALTER TABLE menu_items DROP CONSTRAINT menu_items_panel_check;
ALTER TABLE menu_items ADD CONSTRAINT menu_items_panel_check CHECK (panel IN ('admin', 'colunista', 'equipe'));

DROP POLICY "Logged-in users can read announcements" ON announcements;
CREATE POLICY "Logged-in users can read announcements" ON announcements FOR SELECT USING (current_user_role() IN ('admin', 'columnist', 'equipe'));

DROP POLICY "Logged-in users can read menu_items" ON menu_items;
CREATE POLICY "Logged-in users can read menu_items" ON menu_items FOR SELECT USING (current_user_role() IN ('admin', 'columnist', 'equipe'));

DROP POLICY "Logged-in users can read instruction_items" ON instruction_items;
CREATE POLICY "Logged-in users can read instruction_items" ON instruction_items FOR SELECT USING (current_user_role() IN ('admin', 'columnist', 'equipe'));

-- Was "never columnist<->columnist"; generalized to "never two non-admins"
-- so it also covers columnist<->equipe and equipe<->equipe without having
-- to enumerate every non-admin pair by hand.
DROP POLICY "Users can send allowed messages" ON messages;
CREATE POLICY "Users can send allowed messages" ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND recipient_id <> auth.uid()
    AND (current_user_role() = 'admin' OR user_role_by_id(recipient_id) = 'admin')
  );

-- Lets a logged-in person view (not edit) their own cargo and career plan
-- — needed for the equipe panel's "Meu cargo"/"Meu plano de carreira"
-- pages. Role-agnostic on purpose: an admin or columnist linked to a
-- columnists row with a role_profiles entry can see it too.
CREATE POLICY "People can view their own role profile" ON role_profiles FOR SELECT
  USING (columnist_id = current_user_columnist_id());

CREATE POLICY "People can view their own career plan" ON career_plans FOR SELECT
  USING (columnist_id = current_user_columnist_id());

COMMIT;
