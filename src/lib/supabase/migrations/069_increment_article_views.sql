-- /api/track/view (one call per article page view, so this runs at the
-- site's full public traffic volume) used to SELECT the article's current
-- views then UPDATE it with +1 — two round trips, each counted separately
-- toward Supabase's Logs Ingest quota, and a classic non-atomic
-- read-then-write race: two concurrent requests for the same article can
-- both read the same starting count and one increment gets silently lost.
-- This folds both into one atomic statement.
create or replace function increment_article_views(article_slug text)
returns uuid
language sql
security definer
set search_path = public
as $$
  update articles set views = views + 1 where slug = article_slug returning id;
$$;
