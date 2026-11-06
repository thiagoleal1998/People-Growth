-- "Cargos e Funções" reference table, admin-only — not the org chart itself
-- (OrganogramaCard, driven by columnists.org_chart_role/org_chart_manager_id)
-- but a detailed writeup per role: acronym, full title, a one-line função,
-- and responsibilities split into geral/primárias/secundárias/terciárias.
-- Each field is markdown-lite (same dialect as article bodies — **bold**,
-- "- " lists — rendered with renderMarkdownLite), so a bold sub-label
-- inside a bullet point works the same way admins already expect.
create table role_profiles (
  id uuid primary key default gen_random_uuid(),
  columnist_id uuid references columnists(id) on delete set null,
  acronym text,
  title text,
  function_summary text,
  general_responsibilities text,
  primary_responsibilities text,
  secondary_responsibilities text,
  tertiary_responsibilities text,
  "order" integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table role_profiles enable row level security;
create policy "Admins have full access to role_profiles" on role_profiles for all using (current_user_role() = 'admin');
