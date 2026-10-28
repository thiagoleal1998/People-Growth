-- Canal de Instruções pro colunista: FAQ (perguntas e respostas) e Etapas
-- (passo a passo numerado), os dois geridos pelo admin num só cadastro
-- (kind distingue os dois) e exibidos como seções separadas no painel do
-- autor. Reference content, não broadcast — ao contrário de announcements,
-- não precisa de tabela de "lidos".
create table instruction_items (
  id uuid primary key default uuid_generate_v4(),
  kind text not null check (kind in ('faq', 'step')),
  title text not null,
  body text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table instruction_items enable row level security;

-- Mesmo padrão de announcements/menu_items: qualquer logado (admin ou
-- autor) lê tudo; só admin escreve.
create policy "Logged-in users can read instruction_items" on instruction_items for select
  using (current_user_role() in ('admin', 'author'));
create policy "Admins have full access to instruction_items" on instruction_items for all
  using (current_user_role() = 'admin');
