-- How much of the page a visitor actually scrolled through, as a 0-100
-- percentage. Recorded separately from the view itself (via a beacon sent
-- on page-hide, see /api/track/scroll) since it's only known once the
-- visit ends, not at page-load time.
ALTER TABLE page_views ADD COLUMN scroll_depth SMALLINT CHECK (scroll_depth BETWEEN 0 AND 100);
