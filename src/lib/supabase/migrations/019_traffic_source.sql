-- Campaign attribution: which referrer/UTM params brought a page view.
ALTER TABLE page_views ADD COLUMN referrer TEXT;
ALTER TABLE page_views ADD COLUMN utm_source TEXT;
ALTER TABLE page_views ADD COLUMN utm_medium TEXT;
ALTER TABLE page_views ADD COLUMN utm_campaign TEXT;
