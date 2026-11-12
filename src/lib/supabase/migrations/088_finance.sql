-- Aba "Financeiro" do admin — visível e editável só para o C-level (os
-- sócios fundadores: Thiago, Gustavo, Raul), não para admins em geral.
-- Cobre dois pedaços: lançamentos manuais de caixa (receita/despesa) e
-- faturamento por cliente/projeto de consultoria. Indicadores (MRR, lucro,
-- margem) são calculados em cima desses dois, sem tabela própria.

-- SECURITY DEFINER, mesmo padrão de current_user_role()/
-- current_user_columnist_id() — permite que as policies abaixo cheguem
-- até columnists.is_founder sem recursão de RLS.
CREATE OR REPLACE FUNCTION public.current_user_is_founder() RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT COALESCE((SELECT is_founder FROM columnists WHERE id = current_user_columnist_id()), false);
$$;

-- Um cliente/projeto de consultoria — contract_value é usado como proxy de
-- receita recorrente mensal (MRR) enquanto status = 'active', já que não
-- existe ainda um conceito de fatura/parcela separado.
CREATE TABLE finance_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  contract_value NUMERIC,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lançamento manual de caixa — receita ou despesa. `category` é texto livre
-- (sem tabela própria: o formulário sugere categorias já usadas antes via
-- autocomplete simples) de propósito, pra não exigir uma tela de cadastro
-- de categoria separada neste primeiro recorte. `client_id` só faz sentido
-- pra lançamentos de receita ligados a um cliente de consultoria.
CREATE TABLE finance_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  category TEXT,
  client_id UUID REFERENCES finance_clients(id) ON DELETE SET NULL,
  recurrence TEXT NOT NULL DEFAULT 'one_time' CHECK (recurrence IN ('one_time', 'monthly')),
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX finance_entries_date_idx ON finance_entries (entry_date DESC);
CREATE INDEX finance_entries_type_idx ON finance_entries (type);

ALTER TABLE finance_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders have full access to finance_clients" ON finance_clients
  FOR ALL USING (current_user_role() = 'admin' AND current_user_is_founder());
CREATE POLICY "Founders have full access to finance_entries" ON finance_entries
  FOR ALL USING (current_user_role() = 'admin' AND current_user_is_founder());
