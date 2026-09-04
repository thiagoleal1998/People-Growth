-- Lets an author propose a future publish date/time for an article they
-- submit for review. The admin still has to approve it (moving it to
-- 'scheduled'); once approved, it goes live on its own once scheduled_for
-- arrives — see publishDueScheduledArticles() in src/lib/publish-scheduled.ts.
--
-- 'scheduled' is intentionally NOT added to the authors' WITH CHECK status
-- list in 018_author_publish_rls.sql, so an author can never reach it (or
-- 'published') directly — approval always has to come from an admin.
ALTER TABLE articles ADD COLUMN scheduled_for TIMESTAMPTZ;

ALTER TABLE articles DROP CONSTRAINT articles_status_check;
ALTER TABLE articles ADD CONSTRAINT articles_status_check CHECK (status IN ('draft', 'pending', 'scheduled', 'published'));
