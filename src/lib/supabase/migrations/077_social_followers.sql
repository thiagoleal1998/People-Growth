-- Monitoramento de seguidores/inscritos nas redes sociais (Instagram,
-- YouTube, TikTok, X) pra alimentar a aba "Planos e Projeções". Não
-- reaproveita o CHECK de content_calendar_items (migration 070) porque
-- aquele vocabulário inclui whatsapp/live/other, que não têm uma
-- contagem de "seguidores" com sentido.
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'youtube', 'tiktok', 'x')),
  handle TEXT NOT NULL,
  display_name TEXT,
  external_id TEXT,          -- ex: Channel ID do YouTube, IG Business Account ID
  profile_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_fetch_attempted_at TIMESTAMPTZ,
  last_fetch_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Histórico append-only: "o valor atual" de uma conta é sempre a linha
-- mais recente por fetched_at, seja automática ou manual — sem precisar
-- de lógica especial de "sobrescrever". Também dá o histórico pra
-- mostrar variação ao longo do tempo (7/30 dias).
CREATE TABLE social_follower_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  follower_count INTEGER NOT NULL CHECK (follower_count >= 0),
  source TEXT NOT NULL CHECK (source IN ('api', 'scrape', 'manual')),
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX social_follower_snapshots_account_fetched_idx ON social_follower_snapshots(account_id, fetched_at DESC);

ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_follower_snapshots ENABLE ROW LEVEL SECURITY;

-- Admin-only — dado estratégico interno, sem leitura pro colunista
-- (diferente de instruction_items/announcements).
CREATE POLICY "Admins have full access to social_accounts" ON social_accounts FOR ALL USING (current_user_role() = 'admin');
CREATE POLICY "Admins have full access to social_follower_snapshots" ON social_follower_snapshots FOR ALL USING (current_user_role() = 'admin');
