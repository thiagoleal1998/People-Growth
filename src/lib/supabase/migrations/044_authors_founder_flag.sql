-- Distinguishes the 3 founders from other authors/columnists so the
-- "Sobre" page's main grid can show only them, while everyone else keeps
-- appearing normally everywhere else (Colunistas, the home strip, article
-- bylines, their own /sobre/[slug] bio page).
ALTER TABLE authors ADD COLUMN is_founder BOOLEAN NOT NULL DEFAULT false;

UPDATE authors SET is_founder = true
  WHERE slug IN ('thiago-leal', 'raul-salustiano', 'gustavo-monken');
