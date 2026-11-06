-- Adds "published" to the calendar item status options (043's original
-- CHECK only had planned/in_progress/done) — the natural next stage after
-- "Pronto" once the post has actually gone out, which also drives the
-- "already posted" vs. "overdue" visual on the calendar grid.
ALTER TABLE content_calendar_items DROP CONSTRAINT content_calendar_items_status_check;
ALTER TABLE content_calendar_items ADD CONSTRAINT content_calendar_items_status_check
  CHECK (status IN ('planned', 'in_progress', 'done', 'published'));
