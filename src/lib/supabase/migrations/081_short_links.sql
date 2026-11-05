-- Backs the "Compartilhar" (WhatsApp share) button's short link: the raw
-- article URL (locale + format segment + category + slug) is long enough
-- that it reads badly in a WhatsApp message, unlike the short branded
-- links other outlets' channels use. /api/s/[code] 302-redirects to
-- target_url; public and unauthenticated (both creating and resolving a
-- short link happen from the public site), so it's reached only through
-- createAdminClient() + checkRateLimit() like the site's other public
-- writes, never a direct authenticated-insert policy.
create table short_links (
  code text primary key,
  target_url text not null,
  click_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- The share button looks up an existing code for the same URL before
-- minting a new one, so the same article always gets the same short link
-- instead of a fresh one per share click.
create index short_links_target_url_idx on short_links (target_url);

alter table short_links enable row level security;
create policy "Admins have full access to short_links" on short_links for all using (current_user_role() = 'admin');

-- Same atomic-update shape as migration 080's other counters — the redirect
-- route is public and can be hit concurrently, so a select-then-update
-- here would lose increments under real traffic.
create or replace function increment_short_link_clicks(link_code text)
returns integer
language sql
security definer
set search_path = public
as $$
  update short_links set click_count = click_count + 1 where code = link_code returning click_count;
$$;
