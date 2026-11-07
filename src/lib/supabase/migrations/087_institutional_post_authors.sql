-- Lets more than one C-level member sign the same institutional post (e.g.
-- a joint letter from the CEO and CMO) — replaces the single
-- author_columnist_id FK with a join table, same shape as
-- article_coauthors. Zero rows = "Grupo Festina" institutional voice, no
-- individual signer, same meaning the old null FK had.
alter table institutional_posts drop column author_columnist_id;

create table institutional_post_authors (
  post_id uuid not null references institutional_posts(id) on delete cascade,
  columnist_id uuid not null references columnists(id) on delete cascade,
  primary key (post_id, columnist_id)
);

alter table institutional_post_authors enable row level security;
create policy "Admins have full access to institutional_post_authors" on institutional_post_authors for all using (current_user_role() = 'admin');
-- Mirrors institutional_posts' own public-read rule (published only) rather
-- than the unconditional public read article_coauthors has, since an
-- institutional post's draft signers shouldn't be any more exposed than
-- the draft itself is.
create policy "Published institutional post authors are publicly readable" on institutional_post_authors for select using (
  exists (select 1 from institutional_posts p where p.id = post_id and p.status = 'published')
);
