-- Pins an article to a fixed place on the home page (null = placed by date).
ALTER TABLE articles ADD COLUMN home_slot TEXT CHECK (home_slot IN ('principal', 'secundario_1', 'secundario_2', 'secundario_3'));
