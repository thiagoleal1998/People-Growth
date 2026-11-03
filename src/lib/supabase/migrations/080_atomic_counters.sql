-- Same fix as migration 069 (increment_article_views), for three more
-- counters that had the identical select-then-update race: concurrent
-- requests can read the same starting value and one increment gets
-- silently lost. All public-facing endpoints at real (if modest) traffic
-- volume: comment likes/reports, resource downloads.
create or replace function increment_comment_likes(comment_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  update comments set likes = likes + 1 where id = comment_id and status = 'approved' returning likes;
$$;

create or replace function increment_comment_reports(comment_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  update comments set reports = reports + 1 where id = comment_id and status = 'approved' returning reports;
$$;

create or replace function increment_resource_downloads(resource_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  update resources set download_count = download_count + 1 where id = resource_id returning download_count;
$$;
