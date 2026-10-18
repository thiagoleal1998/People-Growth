-- The "site-assets" bucket was created image-only (allowed_mime_types had no
-- audio entry), which rejected uploads from the new /api/tts route with a
-- 415. Widens it to also accept the MP3 files that route generates, keeping
-- every existing image type, and raises the size cap (5MB was sized for
-- images; a full article's narration can run several MB).
-- Already applied directly via the Storage admin API while building this
-- feature — this file documents that change for the record, same as the
-- rest of this migrations folder, even though the application happened
-- through the API, not the SQL editor.
update storage.buckets
set allowed_mime_types = array(select distinct unnest(allowed_mime_types || array['audio/mpeg'])),
    file_size_limit = 20971520
where id = 'site-assets';
