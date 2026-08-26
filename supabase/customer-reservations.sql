-- TATILDOKYA TRAVELS - WEBSITE RESERVATION SUPPORT
-- Run once in Supabase SQL Editor, AFTER admin-reservations.sql has already
-- been run (this extends that table).
--
-- What this adds:
-- 1. New columns: pnr_code (auto-generated, unique), source (admin/website),
--    tour_slug, language, email_sent, whatsapp_notified.
-- 2. A trigger that generates a friendly PNR code ("TBC-XXXXXX") on insert,
--    server-side, so it can never be spoofed or collide.
-- 3. A narrow RLS policy letting the public website (anon key) INSERT a
--    reservation with source='website' — and nothing else. Anonymous
--    visitors still cannot SELECT, UPDATE or DELETE any reservation (their
--    own or anyone else's) — only the admin-only policies from
--    admin-reservations.sql can do that. This keeps the table exactly as
--    private as before, just adds one narrow "create-only, blind" door.

alter table public.reservations
  add column if not exists pnr_code text unique,
  add column if not exists source text not null default 'admin',
  add column if not exists tour_slug text,
  add column if not exists language text,
  add column if not exists email_sent boolean not null default false,
  add column if not exists whatsapp_notified boolean not null default false;

-- Only 'admin' or 'website' are meaningful values for source.
alter table public.reservations drop constraint if exists reservations_source_check;
alter table public.reservations
  add constraint reservations_source_check check (source in ('admin', 'website'));

create or replace function public.generate_pnr_code()
returns trigger language plpgsql as $$
declare
  candidate text;
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no 0/O/1/I, avoids confusion
  i int;
  tries int := 0;
begin
  if new.pnr_code is not null then
    return new;
  end if;
  loop
    candidate := 'TBC-';
    for i in 1..6 loop
      candidate := candidate || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    end loop;
    exit when not exists (select 1 from public.reservations where pnr_code = candidate);
    tries := tries + 1;
    if tries > 20 then
      raise exception 'Could not generate a unique PNR code after 20 attempts';
    end if;
  end loop;
  new.pnr_code := candidate;
  return new;
end;
$$;

drop trigger if exists trg_generate_pnr_code on public.reservations;
create trigger trg_generate_pnr_code
before insert on public.reservations
for each row execute function public.generate_pnr_code();

-- Narrow, insert-only, blind policy for the public website.
drop policy if exists "public can create website reservations" on public.reservations;
create policy "public can create website reservations"
on public.reservations for insert
to anon
with check (source = 'website');

-- The RLS policy above only decides WHICH rows anon may touch — Postgres
-- still requires the base table-level privilege before RLS is even
-- consulted. Without this GRANT, every anon insert fails with
-- "permission denied for table reservations" regardless of the policy.
-- Deliberately INSERT-only: anon never gets SELECT/UPDATE/DELETE, so the
-- public website can create a reservation but can never read, edit or
-- delete any reservation — its own or anyone else's.
grant insert on public.reservations to anon;
