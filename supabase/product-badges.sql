-- TATILDOKYA TRAVELS - TOUR CARD BADGES
-- Run once in Supabase SQL Editor.
--
-- Adds 3 admin-editable fields per product, shown as badges/tags on the
-- homepage tour cards:
--   badge1            - one of 6 preset "highlight" badges (Top Rated, etc.)
--   badge2            - one of 5 preset "service" badges (Best Seller, etc.)
--   discount_percent  - a number, renders as "Discount up to %X"
-- All three are optional (null = don't show that badge).

alter table public.products
  add column if not exists badge1 text,
  add column if not exists badge2 text,
  add column if not exists discount_percent integer;

alter table public.products drop constraint if exists products_badge1_check;
alter table public.products
  add constraint products_badge1_check check (
    badge1 is null or badge1 in ('top_rated','customer_favorite','trending_now','editors_choice','most_wanted','selling_fast')
  );

alter table public.products drop constraint if exists products_badge2_check;
alter table public.products
  add constraint products_badge2_check check (
    badge2 is null or badge2 in ('best_seller','popular','direct_service','vip_service','premium_service')
  );

alter table public.products drop constraint if exists products_discount_percent_check;
alter table public.products
  add constraint products_discount_percent_check check (
    discount_percent is null or (discount_percent >= 0 and discount_percent <= 100)
  );
