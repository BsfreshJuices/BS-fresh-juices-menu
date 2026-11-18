-- BS Fresh Juices: database setup for Supabase
-- Run this entire file in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name_en text not null default '',
  name_ar text not null default '',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete cascade,
  name_en text not null default '',
  name_ar text not null default '',
  description_en text not null default '',
  description_ar text not null default '',
  price numeric(10,2),
  image_path text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  brand_name text not null default 'BS FRESH JUICES',
  tagline_en text not null default 'FRESHNESS IN EVERY SIP',
  tagline_ar text not null default 'الانتعاش في كل رشفة',
  primary_color text not null default '#123b2d',
  secondary_color text not null default '#1e5942',
  accent_color text not null default '#e58a3a',
  background_color text not null default '#f7f7f1',
  logo_path text,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

create or replace function public.is_bs_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Admins can read admin list" on public.admin_users;
create policy "Admins can read admin list" on public.admin_users
for select to authenticated using (public.is_bs_admin());

drop policy if exists "Public can read active categories" on public.categories;
create policy "Public can read active categories" on public.categories
for select to anon, authenticated using (is_active or public.is_bs_admin());

drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories" on public.categories
for all to authenticated using (public.is_bs_admin()) with check (public.is_bs_admin());

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products" on public.products
for select to anon, authenticated using (
  (is_active and exists (
    select 1 from public.categories c
    where c.id = category_id and c.is_active
  )) or public.is_bs_admin()
);

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products
for all to authenticated using (public.is_bs_admin()) with check (public.is_bs_admin());

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings" on public.site_settings
for select to anon, authenticated using (true);

drop policy if exists "Admins update site settings" on public.site_settings;
create policy "Admins update site settings" on public.site_settings
for all to authenticated using (public.is_bs_admin()) with check (public.is_bs_admin());

insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view menu images" on storage.objects;
create policy "Public can view menu images" on storage.objects
for select to anon, authenticated using (bucket_id = 'menu-images');

drop policy if exists "Admins upload menu images" on storage.objects;
create policy "Admins upload menu images" on storage.objects
for insert to authenticated with check (
  bucket_id = 'menu-images' and public.is_bs_admin()
);

drop policy if exists "Admins update menu images" on storage.objects;
create policy "Admins update menu images" on storage.objects
for update to authenticated using (
  bucket_id = 'menu-images' and public.is_bs_admin()
) with check (
  bucket_id = 'menu-images' and public.is_bs_admin()
);

drop policy if exists "Admins delete menu images" on storage.objects;
create policy "Admins delete menu images" on storage.objects
for delete to authenticated using (
  bucket_id = 'menu-images' and public.is_bs_admin()
);
