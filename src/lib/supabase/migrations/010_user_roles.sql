-- =====================
-- USER ROLES (admin vs author)
-- =====================
-- Links a Supabase Auth user to a role and, for authors, to their public
-- authors row (so they can self-manage their bio/profile and only their
-- own articles).
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'author' CHECK (role IN ('admin', 'author')),
  author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);

-- Backfill: every Supabase Auth user that already exists today was operating
-- under the old "any authenticated user = full admin" model, so they all
-- become 'admin' here to preserve their current access. Downgrade specific
-- people to 'author' afterwards from /admin/usuarios.
INSERT INTO user_profiles (id, email, role)
SELECT id, email, 'admin' FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- SECURITY DEFINER so other tables' RLS policies can call these without
-- recursing back into user_profiles' own RLS.
CREATE OR REPLACE FUNCTION public.current_user_role() RETURNS TEXT
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_author_id() RETURNS UUID
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT author_id FROM user_profiles WHERE id = auth.uid();
$$;

-- =====================
-- Articles: allow a "pending" state for author-submitted content awaiting
-- admin review, and split write access between admins (everything) and
-- authors (their own rows only).
-- =====================
ALTER TABLE articles DROP CONSTRAINT articles_status_check;
ALTER TABLE articles ADD CONSTRAINT articles_status_check CHECK (status IN ('draft', 'pending', 'published'));

DROP POLICY "Authenticated users have full access to articles" ON articles;
CREATE POLICY "Admins have full access to articles" ON articles FOR ALL USING (current_user_role() = 'admin');
CREATE POLICY "Authors manage their own articles" ON articles FOR ALL
  USING (author_id = current_user_author_id())
  WITH CHECK (author_id = current_user_author_id());

-- =====================
-- Authors: admins manage everyone, an author can self-edit only their own row.
-- =====================
DROP POLICY "Authenticated users have full access to authors" ON authors;
CREATE POLICY "Admins have full access to authors" ON authors FOR ALL USING (current_user_role() = 'admin');
CREATE POLICY "Authors manage their own profile" ON authors FOR ALL
  USING (id = current_user_author_id())
  WITH CHECK (id = current_user_author_id());

-- =====================
-- Everything else stays admin-only — the "author" role is scoped to writing
-- articles and editing their own profile, nothing else in the admin panel.
-- =====================
DROP POLICY "Authenticated users have full access to categories" ON categories;
CREATE POLICY "Admins have full access to categories" ON categories FOR ALL USING (current_user_role() = 'admin');

DROP POLICY "Authenticated users have full access to tags" ON tags;
CREATE POLICY "Admins have full access to tags" ON tags FOR ALL USING (current_user_role() = 'admin');

DROP POLICY "Authenticated users have full access to article_tags" ON article_tags;
CREATE POLICY "Admins have full access to article_tags" ON article_tags FOR ALL USING (current_user_role() = 'admin');

DROP POLICY "Authenticated users have full access to portfolio" ON portfolio_cases;
CREATE POLICY "Admins have full access to portfolio" ON portfolio_cases FOR ALL USING (current_user_role() = 'admin');

DROP POLICY "Authenticated users have full access to services" ON services;
CREATE POLICY "Admins have full access to services" ON services FOR ALL USING (current_user_role() = 'admin');

DROP POLICY "Authenticated users have full access to testimonials" ON testimonials;
CREATE POLICY "Admins have full access to testimonials" ON testimonials FOR ALL USING (current_user_role() = 'admin');

DROP POLICY "Authenticated users have full access to leads" ON leads;
CREATE POLICY "Admins have full access to leads" ON leads FOR ALL USING (current_user_role() = 'admin');

DROP POLICY "Authenticated users have full access to newsletter" ON newsletter_subs;
CREATE POLICY "Admins have full access to newsletter" ON newsletter_subs FOR ALL USING (current_user_role() = 'admin');

DROP POLICY "Authenticated users have full access to courses" ON courses;
CREATE POLICY "Admins have full access to courses" ON courses FOR ALL USING (current_user_role() = 'admin');

DROP POLICY "Authenticated users have full access to resources" ON resources;
CREATE POLICY "Admins have full access to resources" ON resources FOR ALL USING (current_user_role() = 'admin');

DROP POLICY "Authenticated users have full access to media" ON media_items;
CREATE POLICY "Admins have full access to media" ON media_items FOR ALL USING (current_user_role() = 'admin');

DROP POLICY "Authenticated users have full access to site_config" ON site_config;
CREATE POLICY "Admins have full access to site_config" ON site_config FOR ALL USING (current_user_role() = 'admin');

DROP POLICY "Authenticated users have full access to error_reports" ON error_reports;
CREATE POLICY "Admins have full access to error_reports" ON error_reports FOR ALL USING (current_user_role() = 'admin');

DROP POLICY "Authenticated users have full access to message_templates" ON message_templates;
CREATE POLICY "Admins have full access to message_templates" ON message_templates FOR ALL USING (current_user_role() = 'admin');

DROP POLICY "Authenticated users have full access to tiktok_engagements" ON tiktok_engagements;
CREATE POLICY "Admins have full access to tiktok_engagements" ON tiktok_engagements FOR ALL USING (current_user_role() = 'admin');

DROP POLICY "Authenticated users have full access to social_integrations" ON social_integrations;
CREATE POLICY "Admins have full access to social_integrations" ON social_integrations FOR ALL USING (current_user_role() = 'admin');

DROP POLICY "Authenticated users have full access to content_drafts" ON content_drafts;
CREATE POLICY "Admins have full access to content_drafts" ON content_drafts FOR ALL USING (current_user_role() = 'admin');
