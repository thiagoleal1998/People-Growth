-- Distinguishes news pieces from opinion columns ("Mea Sententia").
ALTER TABLE articles
  ADD COLUMN format TEXT NOT NULL DEFAULT 'noticia' CHECK (format IN ('noticia', 'opiniao'));
