-- =====================
-- COMMENT INTERACTIONS (likes, reports, threaded replies)
-- =====================
ALTER TABLE comments ADD COLUMN parent_id UUID REFERENCES comments(id) ON DELETE CASCADE;
ALTER TABLE comments ADD COLUMN likes INTEGER NOT NULL DEFAULT 0;
ALTER TABLE comments ADD COLUMN reports INTEGER NOT NULL DEFAULT 0;

CREATE INDEX comments_parent_id_idx ON comments (parent_id);
