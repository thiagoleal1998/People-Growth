-- Feed público de conteúdo institucional (cartas ao leitor do C-level,
-- comunicados oficiais, posicionamentos do Grupo Festina) — separado do
-- pipeline editorial de `articles` por decisão explícita: sem categorias,
-- sem fluxo de revisão colunista->admin, só admin escreve. Não confundir
-- com `institutional_pages` (páginas jurídicas estáticas existentes,
-- Cookies/Termos/etc) — tabela e propósito totalmente diferentes.
create table institutional_posts (
  id uuid primary key default gen_random_uuid(),
  title_pt text not null,
  title_en text,
  slug text not null unique,
  excerpt_pt text,
  excerpt_en text,
  body_pt text not null,
  body_en text,
  cover_image text,
  cover_image_caption text,
  cover_image_credit text,
  -- Nulo = voz institucional da empresa ("Grupo Festina" no byline, sem
  -- pessoa associada); preenchido = carta/comunicado assinado por um
  -- integrante do C-level, reaproveitando o perfil de colunista que
  -- já existe pra cada um deles.
  author_columnist_id uuid references columnists(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_by uuid references user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index institutional_posts_published_idx on institutional_posts (published_at desc) where status = 'published';

alter table institutional_posts enable row level security;
create policy "Admins have full access to institutional_posts" on institutional_posts for all using (current_user_role() = 'admin');
create policy "Published institutional posts are publicly readable" on institutional_posts for select using (status = 'published');
