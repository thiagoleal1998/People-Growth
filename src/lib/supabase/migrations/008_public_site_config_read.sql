-- site_config had no public SELECT policy, so anonymous visitors could never
-- read it — logo_url, favicon_url, hero_photo, live_stream_url, is_live, and
-- the SEO/GEO/AEO fields only ever worked for whoever was logged into /admin
-- in that same browser (their session satisfied the "authenticated" policy).
CREATE POLICY "Public can read site_config" ON site_config FOR SELECT USING (true);
