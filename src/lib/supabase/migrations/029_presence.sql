-- Powers the live "quem está online" widget on the admin dashboard.
-- Updated on every admin/author panel page load (see the dashboard
-- layouts) — no separate heartbeat mechanism, since these panels are
-- used with frequent navigation while someone is actively working.
ALTER TABLE user_profiles ADD COLUMN last_seen_at TIMESTAMPTZ;
