-- Seção "Promoções": promoções compostas manualmente (formulário) OU
-- encontradas automaticamente pela busca diária no Mercado Livre
-- (source = 'manual' | 'mercado_livre'). Não existe API de Canal do
-- WhatsApp nem de link de afiliado do Mercado Livre, então isso só
-- organiza o material (texto + imagem) pra colagem manual no canal;
-- affiliate_link é preenchido manualmente pelo admin quando quiser
-- (gerado nas próprias ferramentas do Mercado Livre) e, se vazio, o texto
-- final usa product_link comum. sent_at é controle pessoal do admin
-- ("já postei isso"), nunca escrito por processo automático.
CREATE TABLE promos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'mercado_livre')),
  external_id TEXT, -- id do item no Mercado Livre (ex: "MLB123..."), null se manual
  product_name TEXT NOT NULL,
  image_url TEXT,
  old_price NUMERIC(10, 2),
  new_price NUMERIC(10, 2) NOT NULL,
  pix_price NUMERIC(10, 2),
  payment_terms TEXT,
  coupon_code TEXT,
  sizes_available TEXT,
  product_link TEXT NOT NULL,
  affiliate_link TEXT, -- colado manualmente pelo admin; usado no texto final se preenchido
  intro_emoji TEXT,
  intro_text TEXT,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL, -- null quando source = 'mercado_livre'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX promos_created_at_idx ON promos (created_at DESC);
-- evita duplicar o mesmo item do Mercado Livre em buscas diárias seguidas
CREATE UNIQUE INDEX promos_external_id_idx ON promos (external_id) WHERE external_id IS NOT NULL;

ALTER TABLE promos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to promos" ON promos FOR ALL USING (current_user_role() = 'admin');

-- Configuração da busca automática: quais termos do Mercado Livre
-- monitorar e qual desconto mínimo vale a pena virar sugestão.
CREATE TABLE promo_search_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL, -- termo de busca, ex: "tenis nike"
  min_discount_pct NUMERIC(5, 2) NOT NULL DEFAULT 20, -- só cria promoção se desconto >= isso
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE promo_search_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to promo_search_rules" ON promo_search_rules FOR ALL USING (current_user_role() = 'admin');
