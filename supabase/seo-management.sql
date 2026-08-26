-- TATILDOKYA TRAVELS - SEO MANAGEMENT
-- Run once in Supabase SQL Editor.

create table if not exists public.seo_pages (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  lang text not null default 'en' check (lang in ('en','tr','es')),
  page_label text,
  seo_title text,
  meta_description text,
  focus_keyword text,
  canonical_url text,
  index_enabled boolean not null default true,
  schema_type text not null default 'WebPage',
  og_title text,
  og_description text,
  og_image text,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.seo_pages enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.seo_pages to anon, authenticated;
grant insert, update, delete on public.seo_pages to authenticated;

-- SEO metadata is public by nature (it is rendered into page <head>), so read access is safe.
drop policy if exists "seo_pages_public_read" on public.seo_pages;
create policy "seo_pages_public_read"
on public.seo_pages for select
to anon, authenticated
using (true);

-- Only users present in public.admin_users can write SEO records.
drop policy if exists "seo_pages_admin_insert" on public.seo_pages;
create policy "seo_pages_admin_insert"
on public.seo_pages for insert
to authenticated
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "seo_pages_admin_update" on public.seo_pages;
create policy "seo_pages_admin_update"
on public.seo_pages for update
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "seo_pages_admin_delete" on public.seo_pages;
create policy "seo_pages_admin_delete"
on public.seo_pages for delete
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create or replace function public.set_seo_pages_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_seo_pages_updated_at on public.seo_pages;
create trigger trg_seo_pages_updated_at
before update on public.seo_pages
for each row execute function public.set_seo_pages_updated_at();
