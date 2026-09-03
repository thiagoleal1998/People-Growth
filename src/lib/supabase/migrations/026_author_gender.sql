-- Lets the site say "Sobre o autor" or "Sobre a autora" correctly on the
-- article byline bar. Defaults to 'masculino' for existing rows, matching
-- the generic "Autor" wording already used throughout the admin panel.
ALTER TABLE authors ADD COLUMN gender TEXT NOT NULL DEFAULT 'masculino' CHECK (gender IN ('masculino', 'feminino'));
