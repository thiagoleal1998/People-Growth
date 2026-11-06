-- Tracks which channels a calendar item (mainly social_post entries) was
-- actually published to, separate from `platform` (the single channel it
-- was *planned* for) — a checklist an admin ticks off after the fact,
-- since the same post sometimes goes out on more than one channel.
alter table content_calendar_items add column published_channels text[] not null default '{}';
