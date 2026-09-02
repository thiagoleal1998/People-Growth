-- =====================
-- Turn the single fixed banner per position into real ad campaigns:
-- multiple ads can exist per slot_key, each optionally targeted at
-- specific articles instead of showing everywhere.
-- =====================

-- ad_slots is now just the position catalog (key/label); the
-- image/link/active fields it had move to the new ads table.
ALTER TABLE ad_slots DROP COLUMN image_url;
ALTER TABLE ad_slots DROP COLUMN link_url;
ALTER TABLE ad_slots DROP COLUMN alt_text;
ALTER TABLE ad_slots DROP COLUMN active;

CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_key TEXT NOT NULL REFERENCES ad_slots(key) ON DELETE CASCADE,
  title TEXT NOT NULL,
  image_url TEXT,
  link_url TEXT,
  alt_text TEXT,
  target_mode TEXT NOT NULL DEFAULT 'all' CHECK (target_mode IN ('all', 'specific')),
  active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ads_slot_key_idx ON ads (slot_key, active);

ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read ads" ON ads FOR SELECT USING (true);
CREATE POLICY "Admins have full access to ads" ON ads FOR ALL USING (current_user_role() = 'admin');

-- Which articles a "specific" ad is targeted at (irrelevant for
-- target_mode = 'all', and for the home-top slot which isn't tied to
-- any article).
CREATE TABLE ad_targets (
  ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  PRIMARY KEY (ad_id, article_id)
);

ALTER TABLE ad_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read ad_targets" ON ad_targets FOR SELECT USING (true);
CREATE POLICY "Admins have full access to ad_targets" ON ad_targets FOR ALL USING (current_user_role() = 'admin');

-- Events now point at the specific ad shown, not just the slot, so
-- reports can break performance down per campaign.
ALTER TABLE ad_events ADD COLUMN ad_id UUID REFERENCES ads(id) ON DELETE SET NULL;
CREATE INDEX ad_events_ad_id_idx ON ad_events (ad_id, event_type, created_at);
