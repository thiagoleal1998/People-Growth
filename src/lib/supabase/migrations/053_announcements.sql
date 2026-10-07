-- Comunicados: broadcast messages admins send to the whole team (every admin
-- and author sees every announcement — unlike notifications, which are
-- per-person). announcement_reads tracks who has seen which one, so the
-- author sidebar can show an unread count the same way it already does for
-- pending comments.
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE announcement_reads (
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (announcement_id, user_id)
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;

-- Anyone with a login (admin or author) reads every announcement; only
-- admins write them.
CREATE POLICY "Logged-in users can read announcements" ON announcements FOR SELECT
  USING (current_user_role() IN ('admin', 'author'));
CREATE POLICY "Admins have full access to announcements" ON announcements FOR ALL
  USING (current_user_role() = 'admin');

-- A read receipt belongs to whoever's session created it — checked against
-- auth.uid() itself, not a client-supplied user id.
CREATE POLICY "Users can read their own announcement_reads" ON announcement_reads FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "Users can mark announcements read for themselves" ON announcement_reads FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins have full access to announcement_reads" ON announcement_reads FOR ALL
  USING (current_user_role() = 'admin');
