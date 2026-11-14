-- The Resumo rápido tab's Sócios/Equipe split was missing a third bucket
-- for the company's own reserve, which the detailed tab already has.
-- Defaults to 0 so existing saved rows keep summing to the same 100%
-- they already did (Sócios + Equipe) until someone adjusts it.
ALTER TABLE finance_projections
  ADD COLUMN quick_company_pct NUMERIC NOT NULL DEFAULT 0;
