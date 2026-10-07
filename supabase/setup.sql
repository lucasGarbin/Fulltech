create table if not exists public.catalog_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.catalog_categories (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique check (char_length(trim(nome)) between 2 and 60),
  descricao text not null default '' check (char_length(descricao) <= 200),
  icone text not null default 'desktop'
    check (icone in ('gamepad', 'blueprint', 'building', 'gradcap', 'desktop', 'monitor', 'workstation', 'printer', 'shield', 'support')),
  created_at timestamptz not null default now()
);

create table if not exists public.catalog_items (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references public.catalog_categories (id) on delete cascade,
  titulo text not null check (char_length(trim(titulo)) between 2 and 120),
  descricao text not null default '' check (char_length(descricao) <= 300),
  url text not null default '',
  arquivo text not null default '',
  criado_em timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (url = '' or url ~* '^https?://')
);

create or replace function public.is_catalog_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.catalog_admins where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_catalog_admin() from public, anon;
grant execute on function public.is_catalog_admin() to authenticated;

alter table public.catalog_admins enable row level security;
alter table public.catalog_categories enable row level security;
alter table public.catalog_items enable row level security;

grant select on public.catalog_admins to authenticated;
grant select on public.catalog_categories, public.catalog_items to anon, authenticated;
grant insert, update, delete on public.catalog_categories, public.catalog_items to authenticated;

drop policy if exists "Admins can read their own access" on public.catalog_admins;
create policy "Admins can read their own access"
  on public.catalog_admins for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Anyone can read catalog categories" on public.catalog_categories;
create policy "Anyone can read catalog categories"
  on public.catalog_categories for select to anon, authenticated using (true);
drop policy if exists "Admins can insert catalog categories" on public.catalog_categories;
create policy "Admins can insert catalog categories"
  on public.catalog_categories for insert to authenticated with check (public.is_catalog_admin());
drop policy if exists "Admins can update catalog categories" on public.catalog_categories;
create policy "Admins can update catalog categories"
  on public.catalog_categories for update to authenticated
  using (public.is_catalog_admin()) with check (public.is_catalog_admin());
drop policy if exists "Admins can delete catalog categories" on public.catalog_categories;
create policy "Admins can delete catalog categories"
  on public.catalog_categories for delete to authenticated using (public.is_catalog_admin());

drop policy if exists "Anyone can read catalog items" on public.catalog_items;
create policy "Anyone can read catalog items"
  on public.catalog_items for select to anon, authenticated using (true);
drop policy if exists "Admins can insert catalog items" on public.catalog_items;
create policy "Admins can insert catalog items"
  on public.catalog_items for insert to authenticated with check (public.is_catalog_admin());
drop policy if exists "Admins can update catalog items" on public.catalog_items;
create policy "Admins can update catalog items"
  on public.catalog_items for update to authenticated
  using (public.is_catalog_admin()) with check (public.is_catalog_admin());
drop policy if exists "Admins can delete catalog items" on public.catalog_items;
create policy "Admins can delete catalog items"
  on public.catalog_items for delete to authenticated using (public.is_catalog_admin());

insert into public.catalog_categories (nome, descricao, icone)
values
  ('Gamer', 'Computadores de alta performance para jogos e streaming.', 'gamepad'),
  ('Projetos Especiais', 'Soluções sob medida para licitações e demandas técnicas.', 'blueprint'),
  ('Corporativo', 'Equipamentos para escritórios e ambientes empresariais.', 'building'),
  ('Educacional', 'Laboratórios e soluções para instituições de ensino.', 'gradcap')
on conflict (nome) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('catalogos', 'catalogos', true, 20971520, array['application/pdf'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can read catalog PDFs" on storage.objects;
create policy "Anyone can read catalog PDFs"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'catalogos');
drop policy if exists "Admins can upload catalog PDFs" on storage.objects;
create policy "Admins can upload catalog PDFs"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'catalogos' and public.is_catalog_admin());
drop policy if exists "Admins can update catalog PDFs" on storage.objects;
create policy "Admins can update catalog PDFs"
  on storage.objects for update to authenticated
  using (bucket_id = 'catalogos' and public.is_catalog_admin())
  with check (bucket_id = 'catalogos' and public.is_catalog_admin());
drop policy if exists "Admins can delete catalog PDFs" on storage.objects;
create policy "Admins can delete catalog PDFs"
  on storage.objects for delete to authenticated
  using (bucket_id = 'catalogos' and public.is_catalog_admin());

-- Crie um usuário em Authentication > Users e libere-o como administrador:
-- insert into public.catalog_admins (user_id)
-- select id from auth.users where email = 'admin@seudominio.com';
