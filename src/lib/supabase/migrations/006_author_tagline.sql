-- A short, author-curated phrase shown in the columnist strip
-- (falls back to the latest article title, then role, when empty).
ALTER TABLE authors
  ADD COLUMN tagline_pt TEXT,
  ADD COLUMN tagline_en TEXT;
