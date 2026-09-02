-- =====================
-- COMMENTS (article discussion)
-- =====================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX comments_article_id_idx ON comments (article_id, status);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Public visitors only ever see approved comments; writes for the public
-- form go through the service role (API route), same as leads/error_reports.
CREATE POLICY "Public can read approved comments" ON comments FOR SELECT USING (status = 'approved');
CREATE POLICY "Admins have full access to comments" ON comments FOR ALL USING (current_user_role() = 'admin');
