-- =====================
-- SOCIAL INTEGRATIONS
-- =====================
CREATE TABLE social_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL UNIQUE CHECK (platform IN ('linkedin', 'instagram', 'tiktok', 'youtube')),
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  profile_id TEXT,
  profile_name TEXT,
  profile_url TEXT,
  status TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'expired')),
  extra_data JSONB,
  connected_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE social_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users have full access to social_integrations" ON social_integrations FOR ALL USING (auth.role() = 'authenticated');

-- =====================
-- CONTENT DRAFTS
-- =====================
CREATE TABLE content_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tema TEXT NOT NULL,
  tom TEXT,
  plataformas TEXT[],
  conteudo JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE content_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users have full access to content_drafts" ON content_drafts FOR ALL USING (auth.role() = 'authenticated');
