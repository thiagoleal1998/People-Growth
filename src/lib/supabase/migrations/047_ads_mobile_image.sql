-- Optional separate banner image for phones. Ads keep one image for desktop
-- (image_url); when this is set, phone-width screens get it instead, since a
-- wide desktop banner is hard to read on a narrow screen.
ALTER TABLE ads ADD COLUMN image_url_mobile TEXT;
