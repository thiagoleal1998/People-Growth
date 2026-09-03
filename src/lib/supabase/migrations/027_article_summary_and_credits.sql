-- Optional "Resumo" box shown collapsed at the top of an article (like
-- UOL's TL;DR pattern) — blank means it just doesn't render. Also adds
-- caption/credit text for the cover image, since it's about to become
-- visible in the article body instead of only used for OG/share images.
ALTER TABLE articles ADD COLUMN summary_pt TEXT;
ALTER TABLE articles ADD COLUMN summary_en TEXT;
ALTER TABLE articles ADD COLUMN cover_image_caption TEXT;
ALTER TABLE articles ADD COLUMN cover_image_credit TEXT;
