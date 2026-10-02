-- Lets an author (or the admin, on their behalf) add a WhatsApp contact
-- link to their public profile, alongside the existing LinkedIn/Instagram.
ALTER TABLE authors ADD COLUMN whatsapp_url TEXT;
