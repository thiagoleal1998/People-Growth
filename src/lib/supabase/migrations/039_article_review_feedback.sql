-- Lets an admin leave written feedback when sending a pending article back
-- to draft instead of approving it outright — surfaced to the author on
-- their edit form and via the notification bell (see requestChanges in
-- admin/artigos/actions.ts). Cleared automatically the next time the
-- author resubmits (intent "schedule"/"send" in autor/artigos/actions.ts),
-- so stale feedback doesn't linger once acted on.
ALTER TABLE articles ADD COLUMN review_feedback TEXT;
