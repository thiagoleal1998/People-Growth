-- Renames the "author" concept to "columnist" at the database level, to
-- match the rest of the site-wide author -> colunista rename (see the
-- app code changes shipped in the same deploy as this migration).
--
-- ALTER TABLE/COLUMN/FUNCTION ... RENAME preserves every dependency
-- automatically (foreign keys, RLS policy expressions, function call
-- sites inside policies) since Postgres tracks these by OID internally,
-- not by name — so most of this migration is pure renames, no need to
-- drop and recreate the ~17 policies that merely reference author_id or
-- current_user_author_id(). The exceptions are the few places where
-- 'author' is a literal VALUE (stored data, or a string compared inside
-- a CHECK/policy clause) rather than a name Postgres tracks — those do
-- need an explicit UPDATE and/or DROP+CREATE, called out below.
--
-- Deliberately NOT touched here (see CLAUDE.md-style rationale kept with
-- the app code changes in the same commit):
--   - ticket_comments.author_id / author_name: points at user_profiles
--     (whoever wrote a ticket comment, admin or columnist), not the
--     columnists entity — renaming it would misname what it actually means.
--   - article_coauthors itself keeps its table name; only its author_id
--     column (which points at columnists) is renamed.
BEGIN;

-- === Structural renames (dependencies follow automatically) ===
ALTER TABLE authors RENAME TO columnists;
ALTER TABLE articles RENAME COLUMN author_id TO columnist_id;
ALTER TABLE article_coauthors RENAME COLUMN author_id TO columnist_id;
ALTER TABLE user_profiles RENAME COLUMN author_id TO columnist_id;
ALTER FUNCTION current_user_author_id() RENAME TO current_user_columnist_id;

-- === Literal 'author' role value: existing data + the two CHECK
-- constraints that enumerate it (a RENAME can't reach a string literal) ===
ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_role_check;
UPDATE user_profiles SET role = 'columnist' WHERE role = 'author';
ALTER TABLE user_profiles ALTER COLUMN role SET DEFAULT 'columnist';
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check CHECK (role IN ('admin', 'columnist'));

ALTER TABLE internal_tickets DROP CONSTRAINT internal_tickets_created_by_role_check;
UPDATE internal_tickets SET created_by_role = 'columnist' WHERE created_by_role = 'author';
ALTER TABLE internal_tickets ADD CONSTRAINT internal_tickets_created_by_role_check CHECK (created_by_role IN ('admin', 'columnist'));

-- menu_items.panel uses the Portuguese 'autor' literal (mirrors the /autor
-- URL prefix, which the app-code side of this rename changes to
-- /colunista) — same literal-value problem, separate from the role column.
ALTER TABLE menu_items DROP CONSTRAINT menu_items_panel_check;
UPDATE menu_items SET panel = 'colunista' WHERE panel = 'autor';
ALTER TABLE menu_items ADD CONSTRAINT menu_items_panel_check CHECK (panel IN ('admin', 'colunista'));

-- === The 3 policies whose clause embeds the 'author' literal directly
-- (not just author_id/current_user_author_id(), which renamed for free
-- above) — these must be dropped and recreated since the literal text
-- itself has to change. ===
DROP POLICY "Logged-in users can read announcements" ON announcements;
CREATE POLICY "Logged-in users can read announcements" ON announcements FOR SELECT USING (current_user_role() IN ('admin', 'columnist'));

DROP POLICY "Logged-in users can read menu_items" ON menu_items;
CREATE POLICY "Logged-in users can read menu_items" ON menu_items FOR SELECT USING (current_user_role() IN ('admin', 'columnist'));

DROP POLICY "Logged-in users can read instruction_items" ON instruction_items;
CREATE POLICY "Logged-in users can read instruction_items" ON instruction_items FOR SELECT USING (current_user_role() IN ('admin', 'columnist'));

-- === Cosmetic renames (policy/index/constraint display names) — purely
-- for readability when inspecting the schema later, no behavior change. ===
ALTER INDEX article_coauthors_author_id_idx RENAME TO article_coauthors_columnist_id_idx;
ALTER TABLE columnists RENAME CONSTRAINT authors_gender_check TO columnists_gender_check;
ALTER TABLE articles RENAME CONSTRAINT articles_author_id_fkey TO articles_columnist_id_fkey;

ALTER POLICY "Admins have full access to authors" ON columnists RENAME TO "Admins have full access to columnists";
ALTER POLICY "Authors manage their own profile" ON columnists RENAME TO "Columnists manage their own profile";
ALTER POLICY "Authors can read comments on own articles" ON comments RENAME TO "Columnists can read comments on own articles";
ALTER POLICY "Authors can select own articles" ON articles RENAME TO "Columnists can select own articles";
ALTER POLICY "Authors can delete own articles" ON articles RENAME TO "Columnists can delete own articles";
ALTER POLICY "Authors can insert own draft/pending articles" ON articles RENAME TO "Columnists can insert own draft/pending articles";
ALTER POLICY "Authors can update own articles to draft/pending" ON articles RENAME TO "Columnists can update own articles to draft/pending";
ALTER POLICY "Authors can moderate comments on own articles" ON comments RENAME TO "Columnists can moderate comments on own articles";
ALTER POLICY "Authors can delete comments on own articles" ON comments RENAME TO "Columnists can delete comments on own articles";
ALTER POLICY "Authors can read page views of their own articles" ON page_views RENAME TO "Columnists can read page views of their own articles";
ALTER POLICY "Authors manage categories of their own articles" ON article_categories RENAME TO "Columnists manage categories of their own articles";
ALTER POLICY "Authors manage coauthors of their own articles" ON article_coauthors RENAME TO "Columnists manage coauthors of their own articles";
ALTER POLICY "Authors can create their own tickets" ON internal_tickets RENAME TO "Columnists can create their own tickets";
ALTER POLICY "Authors can read their own tickets" ON internal_tickets RENAME TO "Columnists can read their own tickets";
ALTER POLICY "Authors can read events on own tickets" ON ticket_events RENAME TO "Columnists can read events on own tickets";
ALTER POLICY "Authors can read comments on own tickets" ON ticket_comments RENAME TO "Columnists can read comments on own tickets";
ALTER POLICY "Authors can comment on own tickets" ON ticket_comments RENAME TO "Columnists can comment on own tickets";

COMMIT;
