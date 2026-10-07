-- Two categories requested directly: Saúde e Bem-estar, Desenvolvimento Pessoal.
-- ON CONFLICT guards against re-running this file against a database where they
-- were already added by hand through the new category manager (Configurações).
INSERT INTO categories (name_pt, name_en, slug, color) VALUES
  ('Saúde e Bem-estar', 'Health & Wellness', 'saude-e-bem-estar', '#06D6A0'),
  ('Desenvolvimento Pessoal', 'Personal Development', 'desenvolvimento-pessoal', '#FFB703')
ON CONFLICT (slug) DO NOTHING;
