-- Expands authors.gender beyond the binary masculino/feminino it was
-- created with (026_author_gender.sql). Existing rows keep their current
-- value — this only widens which values are allowed going forward.
ALTER TABLE authors DROP CONSTRAINT IF EXISTS authors_gender_check;
ALTER TABLE authors ADD CONSTRAINT authors_gender_check
  CHECK (gender IN ('masculino', 'feminino', 'nao_binario', 'genero_fluido', 'agenero', 'prefiro_nao_dizer'));
