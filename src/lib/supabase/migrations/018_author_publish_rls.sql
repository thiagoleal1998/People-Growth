-- Security fix: the previous "Authors manage their own articles" policy only
-- checked author_id, not status — an author could call the Supabase REST API
-- directly (using their own session) and set status='published' on their own
-- article, bypassing the admin-review step that the app UI enforces only in
-- application code (upsertOwnArticle always forces draft/pending).
DROP POLICY "Authors manage their own articles" ON articles;

CREATE POLICY "Authors can select own articles" ON articles FOR SELECT
  USING (author_id = current_user_author_id());

CREATE POLICY "Authors can delete own articles" ON articles FOR DELETE
  USING (author_id = current_user_author_id());

CREATE POLICY "Authors can insert own draft/pending articles" ON articles FOR INSERT
  WITH CHECK (author_id = current_user_author_id() AND status IN ('draft', 'pending'));

CREATE POLICY "Authors can update own articles to draft/pending" ON articles FOR UPDATE
  USING (author_id = current_user_author_id())
  WITH CHECK (author_id = current_user_author_id() AND status IN ('draft', 'pending'));

-- Also close the same anon-insert gap flagged for leads/newsletter/error_reports:
-- the app already writes to these exclusively through service-role API routes
-- (with rate limiting + honeypot checks), so the public INSERT policies just
-- let anyone bypass those checks by calling PostgREST directly with the anon key.
DROP POLICY IF EXISTS "Anyone can insert leads" ON leads;
DROP POLICY IF EXISTS "Anyone can subscribe newsletter" ON newsletter_subs;
DROP POLICY IF EXISTS "Anyone can insert error reports" ON error_reports;
