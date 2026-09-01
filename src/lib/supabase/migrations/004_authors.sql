-- =====================
-- AUTHORS (columnists)
-- =====================
CREATE TABLE authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  role_pt TEXT,
  role_en TEXT,
  bio_pt TEXT,
  bio_en TEXT,
  photo_url TEXT,
  email TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE articles
  ADD CONSTRAINT articles_author_id_fkey FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE SET NULL;

-- Row Level Security
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active authors" ON authors FOR SELECT USING (status = 'active');
CREATE POLICY "Authenticated users have full access to authors" ON authors FOR ALL USING (auth.role() = 'authenticated');

-- Seed: Thiago Leal, so existing articles keep an author once assigned
INSERT INTO authors (name, slug, role_pt, role_en, bio_pt, bio_en, status, "order") VALUES
  ('Thiago Leal', 'thiago-leal',
   'Fundador da People & Growth · Especialista em Marketing, Growth e IA',
   'Founder of People & Growth · Marketing, Growth and AI specialist',
   'Consultor estratégico com mais de 7 anos de experiência em Marketing Digital, Growth e Inteligência Artificial.',
   'Strategic consultant with over 7 years of experience in Digital Marketing, Growth and Artificial Intelligence.',
   'active', 1);
