-- Admin-only editorial flag shown as a blinking-dot "MATÉRIA EM
-- ATUALIZAÇÃO" tag next to the format/sub-brand badges on the home
-- page's "destaque especial" hero — same admin-only, manual-toggle
-- pattern as is_special_feature (065) and home_slot.
alter table articles add column is_updating boolean not null default false;
