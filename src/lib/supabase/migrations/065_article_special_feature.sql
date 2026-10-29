-- Admin-only editorial flag for the full-bleed "destaque especial" hero
-- treatment on the article page (image + overlaid headline + related-links
-- strip, replacing the normal dark-gradient header) — same admin-only
-- pattern as home_slot (not exposed in the author editor).
alter table articles add column is_special_feature boolean not null default false;
