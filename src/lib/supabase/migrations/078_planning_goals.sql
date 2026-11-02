-- Metas da aba "Planos e Projeções": o admin cadastra um alvo e o sistema
-- mostra o progresso real contra ele — sem projeção automática por
-- tendência, sem quadro de notas livre. `metric` genérico cobre tanto
-- métricas do próprio site (dado real já em page_views/leads/
-- newsletter_subs) quanto seguidores de uma rede social cadastrada em
-- social_accounts (migration 077) — um cadastro e uma UI só, já que o
-- admin pediu as duas coisas como uma coisa estratégica só.
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  metric TEXT NOT NULL CHECK (metric IN ('page_views', 'unique_visitors', 'leads', 'newsletter_subs', 'social_followers')),
  social_account_id UUID REFERENCES social_accounts(id) ON DELETE SET NULL,
  target_value NUMERIC NOT NULL CHECK (target_value > 0),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  target_date DATE NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'archived')),
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT goals_social_account_required CHECK (metric <> 'social_followers' OR social_account_id IS NOT NULL)
);

CREATE INDEX goals_status_idx ON goals(status);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to goals" ON goals FOR ALL USING (current_user_role() = 'admin');
