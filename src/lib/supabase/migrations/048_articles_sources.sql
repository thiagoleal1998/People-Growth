-- Sources the author consulted for an article (where the research came from).
-- Stored as a JSON list of { label, url } and shown at the end of the article.
ALTER TABLE articles ADD COLUMN sources JSONB NOT NULL DEFAULT '[]'::jsonb;
