-- Run this once in Supabase SQL Editor to enable custom colours for each menu category.
alter table public.categories
  add column if not exists theme_primary text,
  add column if not exists theme_secondary text,
  add column if not exists theme_accent text,
  add column if not exists theme_background text;
