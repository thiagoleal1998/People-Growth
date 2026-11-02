-- "Ao vivo agora" (LiveStatsWidget) was inferring who's currently on the
-- site from page_views.created_at within a 5-minute window — but
-- Analytics.tsx only ever fires ONE /api/track/view per path change, so a
-- visitor who opens one article and keeps reading past 5 minutes silently
-- drops out of the live count even though they're still there. A separate
-- heartbeat table decouples "is this visitor still here" from page-view
-- analytics (which must keep counting one row per page load, not per
-- minute) — Analytics.tsx now pings this every 60s while the tab is
-- visible, upserting the same row.
create table visitor_heartbeats (
  visitor_id text primary key,
  last_seen_at timestamptz not null default now()
);

alter table visitor_heartbeats enable row level security;

-- Writes only ever happen through the admin client (service role) in the
-- heartbeat route handler, same as page_views' own insert path — no
-- authenticated-write policy needed. Only admins ever need to read it
-- directly (the live-stats route itself also uses the admin client).
create policy "Admins can read visitor_heartbeats" on visitor_heartbeats for select
  using (current_user_role() = 'admin');
