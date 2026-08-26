-- TATILDOKYA TRAVELS - SITE-WIDE RATING (TripAdvisor)
-- Run once in Supabase SQL Editor.
--
-- Single-row settings table so the TripAdvisor rating/review count shown in the
-- Organization schema (SeoHead.astro) can be updated from /admin instead of being
-- hardcoded in the source. Pulled into a generated file by `npm run seo:sync`
-- (same convention as supabase/seo-management.sql), so a build always uses the
-- last-synced value rather than making a live request per page.

create table if not exists public.site_rating (
  id integer primary key default 1,
  rating_value numeric(2,1) not null default 4.9 check (rating_value >= 0 and rating_value <= 5),
  review_count integer not null default 1141 check (review_count >= 0),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint site_rating_singleton check (id = 1)
);

insert into public.site_rating (id, rating_value, review_count)
values (1, 4.9, 1141)
on conflict (id) do nothing;

alter table public.site_rating enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.site_rating to anon, authenticated;
grant update on public.site_rating to authenticated;

-- The rating is public by nature (it is rendered into every page's <head>), so read access is safe.
drop policy if exists "site_rating_public_read" on public.site_rating;
create policy "site_rating_public_read"
on public.site_rating for select
to anon, authenticated
using (true);

-- Only users present in public.admin_users can update the rating.
drop policy if exists "site_rating_admin_update" on public.site_rating;
create policy "site_rating_admin_update"
on public.site_rating for update
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create or replace function public.set_site_rating_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_site_rating_updated_at on public.site_rating;
create trigger trg_site_rating_updated_at
before update on public.site_rating
for each row execute function public.set_site_rating_updated_at();
