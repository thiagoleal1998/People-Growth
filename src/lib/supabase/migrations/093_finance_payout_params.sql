-- Configurable pay scale for colunistas, used by /admin/financeiro/parametros
-- and pulled automatically into the "Visão geral" dashboard's current-month
-- expense total. Singleton (same pattern as finance_projections): one row,
-- always upserted in place, not a history of past rates.
CREATE TABLE finance_payout_params (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001',
  -- R$ paid per article published in the month.
  per_article_rate NUMERIC NOT NULL DEFAULT 5,
  -- Weekly "mais lidas" ranking bonus, R$ per place — index 0 is 1st place,
  -- index 4 is 5th. Summed across every 7-day block of the month (see
  -- src/lib/columnist-payout.ts for how a month is split into those blocks).
  weekly_rank_bonuses JSONB NOT NULL DEFAULT '[100, 90, 80, 70, 60]'::jsonb,
  updated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE finance_payout_params ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Founders have full access to finance_payout_params" ON finance_payout_params
  FOR ALL USING (current_user_role() = 'admin' AND current_user_is_founder());
