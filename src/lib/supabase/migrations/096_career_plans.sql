-- Plano de carreira per team member, edited from the new founders-only
-- "RH" tab in /admin/empresa. One row per columnist (UNIQUE), reusing
-- current_user_is_founder() already defined in 088_finance.sql — same
-- founders-only policy shape as finance_payout_params (093).
CREATE TABLE career_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  columnist_id UUID NOT NULL UNIQUE REFERENCES columnists(id) ON DELETE CASCADE,
  current_summary TEXT,
  goals TEXT,
  next_review_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE career_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Founders have full access to career_plans" ON career_plans
  FOR ALL USING (current_user_role() = 'admin' AND current_user_is_founder());
