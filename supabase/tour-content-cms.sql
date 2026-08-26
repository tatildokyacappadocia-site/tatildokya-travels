-- TATILDOKYA TRAVELS - DYNAMIC TOUR CONTENT (ADMIN-MANAGED)
-- Run once in Supabase SQL Editor.
--
-- This adds a `tour_content` table holding the FULL editable content for a
-- tour page (title, description, included items, FAQ, images) — one row
-- per (product, language). Pricing/capacity/calendar already lives on
-- `products` and its availability table; this table is purely the page
-- copy/content layer.
--
-- New tours created entirely from the admin panel automatically get a live
-- page at /{lang}/tours/{slug}/ with NO code deploy required, because the
-- site reads this table at request time (see src/pages/[lang]/tours/[slug].astro).

create table if not exists public.tour_content (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  language text not null check (language in ('en','tr','es')),
  title text not null default '',
  seo_title text default '',
  meta_description text default '',
  hero_description text default '',
  overview_html text default '', -- one or more paragraphs, plain text with blank-line-separated paragraphs
  included_items text[] not null default '{}',
  important_info_items text[] not null default '{}',
  faq jsonb not null default '[]', -- [{ "question": "...", "answer": "..." }, ...]
  hero_image_url text default '',
  gallery_image_urls text[] not null default '{}',
  duration_text text default '',
  updated_at timestamptz not null default now(),
  unique (product_id, language)
);

create index if not exists tour_content_product_id_idx on public.tour_content(product_id);

alter table public.tour_content enable row level security;

-- Public (anon) can read content for ACTIVE products only — this is what
-- powers the live public-facing tour page.
drop policy if exists "public can read tour content" on public.tour_content;
create policy "public can read tour content"
on public.tour_content for select
to anon
using (
  exists (
    select 1 from public.products p
    where p.id = tour_content.product_id and p.active = true
  )
);

-- Only authenticated admin users (matching the same pattern as the rest of
-- the admin panel) can create/edit/delete tour content.
drop policy if exists "admin can manage tour content" on public.tour_content;
create policy "admin can manage tour content"
on public.tour_content for all
to authenticated
using (exists (select 1 from public.admin_users au where au.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

grant select on public.tour_content to anon;
grant select, insert, update, delete on public.tour_content to authenticated;

-- Ensure authenticated admin users can INSERT new products too (the
-- existing admin panel only ever UPDATEs products, so an explicit INSERT
-- policy may not exist yet — this is needed for the new "Yeni Tur Ekle"
-- flow to work).
drop policy if exists "admin can insert products" on public.products;
create policy "admin can insert products"
on public.products for insert
to authenticated
with check (exists (select 1 from public.admin_users au where au.user_id = auth.uid()));

create or replace function public.touch_tour_content_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_tour_content on public.tour_content;
create trigger trg_touch_tour_content
before update on public.tour_content
for each row execute function public.touch_tour_content_updated_at();
