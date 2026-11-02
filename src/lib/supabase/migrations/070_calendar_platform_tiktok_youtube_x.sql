-- Adds TikTok, YouTube and X to the calendar's "Plataforma" options
-- (043_content_calendar_items.sql's original CHECK only had instagram,
-- linkedin, whatsapp, live, other). Postgres auto-named the original
-- constraint after the table+column, since it wasn't given an explicit name.
ALTER TABLE content_calendar_items DROP CONSTRAINT content_calendar_items_platform_check;
ALTER TABLE content_calendar_items ADD CONSTRAINT content_calendar_items_platform_check
  CHECK (platform IN ('instagram', 'linkedin', 'whatsapp', 'tiktok', 'youtube', 'x', 'live', 'other'));
