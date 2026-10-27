-- =====================
-- Columnist acceptance terms — every author must explicitly accept (or
-- decline) the "Termo de Aceite" before they can create content, and a
-- decline hides their public profile (see isAuthorPubliclyVisible in
-- src/lib/founder-data.ts) while leaving their already-published articles
-- up. Both are timestamps rather than a single status enum so the admin
-- can see exactly when the author acted, and so "never answered" (both
-- null) is distinguishable from either outcome.
-- =====================
ALTER TABLE authors ADD COLUMN terms_accepted_at TIMESTAMPTZ;
ALTER TABLE authors ADD COLUMN terms_declined_at TIMESTAMPTZ;

-- SECURITY DEFINER, same pattern as current_user_role()/current_user_author_id()
-- in 010_user_roles.sql, so the articles RLS policies below can check it
-- without recursing into authors' own RLS.
CREATE OR REPLACE FUNCTION public.current_user_terms_accepted() RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT terms_accepted_at IS NOT NULL FROM authors WHERE id = current_user_author_id();
$$;

-- Re-create the two author-write article policies from 018_author_publish_rls.sql
-- with the terms check added — this is the actual enforcement (the Server
-- Action check in artigos/actions.ts is a UI-level convenience on top of this,
-- not a substitute for it, per the app's existing "RLS is the primary
-- authorization layer" convention).
DROP POLICY "Authors can insert own draft/pending articles" ON articles;
CREATE POLICY "Authors can insert own draft/pending articles" ON articles FOR INSERT
  WITH CHECK (author_id = current_user_author_id() AND status IN ('draft', 'pending') AND current_user_terms_accepted());

DROP POLICY "Authors can update own articles to draft/pending" ON articles;
CREATE POLICY "Authors can update own articles to draft/pending" ON articles FOR UPDATE
  USING (author_id = current_user_author_id())
  WITH CHECK (author_id = current_user_author_id() AND status IN ('draft', 'pending') AND current_user_terms_accepted());

-- The actual legal text, editable from /admin/paginas like the site's other
-- institutional pages (see 013_institutional_pages.sql) — not hardcoded into
-- the author-panel modal, so fixing a typo in it doesn't need a deploy.
INSERT INTO institutional_pages (slug, title_pt, body_pt) VALUES
('termo-aceite-colunistas', 'Termo de Aceite — Colunistas Festina', $$Ao aceitar estas condições, o(a) colunista declara estar de acordo com os seguintes termos:

## 1. Natureza da relação
A colaboração com o Grupo Festina não estabelece, por si só, vínculo empregatício ou relação trabalhista entre as partes, observada a legislação aplicável.

## 2. Gratuidade da publicação
A produção e a publicação dos textos serão realizadas em caráter gratuito, sem remuneração ou qualquer contraprestação financeira ao(à) colunista.

## 3. Autorização de uso e direitos sobre os textos
O(a) colunista autoriza o Grupo Festina a publicar, editar, divulgar e manter os textos disponíveis em seus canais de comunicação por prazo indeterminado, sem custos ou remuneração, respeitados os direitos autorais aplicáveis. A remoção dos textos poderá ser solicitada pelo(a) colunista a qualquer momento.

## 4. Uso para portfólio
O(a) colunista poderá utilizar os textos publicados no Festina em seu portfólio profissional e para divulgar seu trabalho, com a devida referência à publicação original.

## 5. Permanência dos textos no ar
Não será exigido do(a) colunista qualquer pagamento ou contribuição financeira para a publicação ou permanência dos textos no ar.

## 6. Ausência de exclusividade
A colaboração não exige exclusividade. O(a) colunista poderá publicar textos em outras mídias e plataformas, desde que não reproduza, na íntegra, em outro veículo, o mesmo texto publicado no Festina.

Ao aceitar estas condições, o(a) colunista confirma que leu, compreendeu e concorda com os termos acima.$$);
