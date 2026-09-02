-- =====================
-- PAGE VIEWS (first-party, anonymous analytics — no cookies, no PII)
-- =====================
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path TEXT NOT NULL,
  page_type TEXT NOT NULL DEFAULT 'page' CHECK (page_type IN ('page', 'article')),
  article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
  visitor_id TEXT NOT NULL,
  locale TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX page_views_created_at_idx ON page_views (created_at);
CREATE INDEX page_views_article_id_idx ON page_views (article_id);
CREATE INDEX page_views_path_idx ON page_views (path);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Writes only ever go through the service role (the tracking API), same
-- pattern as leads/error_reports/rate_limits. No public read either —
-- raw analytics events are admin-only.
CREATE POLICY "Admins have full access to page_views" ON page_views FOR ALL USING (current_user_role() = 'admin');

-- =====================
-- AD SLOTS (manageable banner positions, fixed catalog like institutional_pages)
-- =====================
CREATE TABLE ad_slots (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  alt_text TEXT,
  active BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ad_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read ad_slots" ON ad_slots FOR SELECT USING (true);
CREATE POLICY "Admins have full access to ad_slots" ON ad_slots FOR ALL USING (current_user_role() = 'admin');

INSERT INTO ad_slots (key, label) VALUES
  ('home-top', 'Topo da Home (leaderboard)'),
  ('article-sidebar', 'Barra lateral do artigo (retângulo)'),
  ('article-instream', 'Dentro do artigo (nativo)');

-- =====================
-- AD EVENTS (impressions/clicks per slot)
-- =====================
CREATE TABLE ad_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_slot_key TEXT NOT NULL REFERENCES ad_slots(key) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('impression', 'click')),
  path TEXT,
  visitor_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ad_events_slot_idx ON ad_events (ad_slot_key, event_type, created_at);

ALTER TABLE ad_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to ad_events" ON ad_events FOR ALL USING (current_user_role() = 'admin');

-- =====================
-- Let authors read comments on their own articles regardless of status,
-- so "estatísticas" can show pending/rejected too, not just approved.
-- =====================
CREATE POLICY "Authors can read comments on own articles" ON comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM articles
    WHERE articles.id = comments.article_id
    AND articles.author_id = current_user_author_id()
  )
);
