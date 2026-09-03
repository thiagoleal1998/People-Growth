-- =====================
-- Fix 1: "ads" and "ad_targets" were publicly readable in full, including
-- inactive/draft campaigns and which articles unreleased "specific" ads
-- target — the app's own queries filter by active=true, but anyone calling
-- PostgREST directly with the anon key bypassed that filter entirely.
-- =====================
DROP POLICY "Public can read ads" ON ads;
CREATE POLICY "Public can read active ads" ON ads FOR SELECT USING (active = true);

DROP POLICY "Public can read ad_targets" ON ad_targets;
CREATE POLICY "Public can read targets of active ads" ON ad_targets FOR SELECT USING (
  EXISTS (SELECT 1 FROM ads WHERE ads.id = ad_targets.ad_id AND ads.active = true)
);

-- =====================
-- Fix 2: every code path that updates a comment (admin and author
-- moderation) only ever sets `status` — but the RLS UPDATE policies only
-- check row ownership, not which columns are touched. A valid session
-- calling the Supabase client directly could otherwise rewrite a comment's
-- body/name/email while leaving it displayed as the original commenter's.
-- Column-level privileges are enforced independently of and in addition to
-- RLS, so this closes the gap regardless of what a future policy allows.
-- =====================
REVOKE UPDATE ON comments FROM authenticated;
GRANT UPDATE (status) ON comments TO authenticated;
