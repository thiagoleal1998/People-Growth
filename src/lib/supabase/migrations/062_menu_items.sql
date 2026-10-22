-- Lets the sidebar's top-level order and labels be customized from the
-- admin, for both the admin and author panels. Only order + label are
-- stored here — href/icon/countKey stay code-defined, since those are tied
-- to actual routes and functionality, not cosmetic. No rows for a panel
-- means "use the code defaults", so this starts empty on purpose.
create table menu_items (
  id text not null,
  panel text not null check (panel in ('admin', 'autor')),
  label text not null,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (panel, id)
);

alter table menu_items enable row level security;

-- Every logged-in admin/author needs to read both panels' config to render
-- their own sidebar (the author panel's own layout reads the autor rows the
-- same way the admin layout reads the admin ones); only admins customize it.
create policy "Logged-in users can read menu_items" on menu_items for select
  using (current_user_role() in ('admin', 'author'));
create policy "Admins have full access to menu_items" on menu_items for all
  using (current_user_role() = 'admin');
