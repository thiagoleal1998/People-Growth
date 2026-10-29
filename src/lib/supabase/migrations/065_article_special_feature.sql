-- Admin-only editorial flag for the full-bleed "destaque especial" treatment
-- on the HOME PAGE's featured-article block (image + overlaid headline +
-- the pinned secondary articles as a related-links strip, replacing the
-- normal thumbnail+title layout) — same admin-only pattern as home_slot
-- (not exposed in the author editor), and only takes effect when this
-- article is actually the home's pinned "principal" slot.
alter table articles add column is_special_feature boolean not null default false;
