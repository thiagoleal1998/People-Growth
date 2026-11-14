-- Second, simpler tab on the Projeção calculator (/admin/financeiro/projecao):
-- a quick Lucro - Gastos = Margem split between sócios and equipe, separate
-- from the detailed per-person payroll projection already on the first tab.
-- Same singleton row (finance_projections), just four more columns.
ALTER TABLE finance_projections
  ADD COLUMN quick_profit NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN quick_costs NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN quick_partners_pct NUMERIC NOT NULL DEFAULT 50,
  ADD COLUMN quick_team_pct NUMERIC NOT NULL DEFAULT 50;
