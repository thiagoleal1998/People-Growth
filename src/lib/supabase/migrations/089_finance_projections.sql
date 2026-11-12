-- Salva o estado da calculadora de Projeção (/admin/financeiro/projecao)
-- pra poder voltar e continuar editando depois, em vez de perder tudo a
-- cada recarregamento da página. Singleton de propósito: não é um
-- histórico de cenários, é "a projeção atual" — sempre a mesma linha
-- (id fixo) é atualizada a cada salvamento.
CREATE TABLE finance_projections (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001',
  revenue NUMERIC NOT NULL DEFAULT 0,
  expense NUMERIC NOT NULL DEFAULT 0,
  company_pct NUMERIC NOT NULL DEFAULT 50,
  partners_pct NUMERIC NOT NULL DEFAULT 50,
  payroll_tax_pct NUMERIC NOT NULL DEFAULT 80,
  -- { "<columnist_id>": salário_bruto }
  salaries JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- { "<columnist_id>": percentual_do_bloco_de_socios }
  partner_shares JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE finance_projections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Founders have full access to finance_projections" ON finance_projections
  FOR ALL USING (current_user_role() = 'admin' AND current_user_is_founder());
