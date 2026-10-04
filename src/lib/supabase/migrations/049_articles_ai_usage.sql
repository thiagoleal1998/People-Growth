-- Which ways artificial intelligence was used in an article (empty = none).
-- The declaration shown at the end of the article is built from these values.
ALTER TABLE articles ADD COLUMN ai_usage TEXT[] NOT NULL DEFAULT '{}';
