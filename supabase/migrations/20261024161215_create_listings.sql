-- Listings shown on the discovery map. Mirrors the Listing type in lib/data.ts.
-- Read-only for now: there is no authentication yet, so RLS only allows SELECT.
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 90),
  description text not null check (char_length(description) between 1 and 1200),
  intention text not null
    check (intention in ('looking', 'offering', 'together', 'exchange')),
  category text not null
    check (category in ('tennis', 'plants', 'cooking', 'moving', 'drawing', 'languages', 'cycling', 'diy')),
  neighborhood text not null,
  lat double precision not null check (lat between -90 and 90),
  lng double precision not null check (lng between -180 and 180),
  author_name text not null,
  availability jsonb not null
    check (availability ->> 'mode' in ('date', 'recurring', 'arrangement')),
  compensation text not null
    check (compensation in ('free', 'coffee', 'mutual', 'paid')),
  amount numeric(10, 2) check (amount > 0),
  unit text check (unit in ('hour', 'session')),
  offer text,
  wanted text,
  created_at timestamptz not null default now(),
  -- Paid listings need an amount and unit; other listings have neither.
  constraint listings_paid_terms check (
    (compensation = 'paid') = (amount is not null and unit is not null)
  ),
  -- Exchanges describe both sides of the swap.
  constraint listings_exchange_terms check (
    intention <> 'exchange' or (offer is not null and wanted is not null)
  )
);

create index listings_created_at_idx on public.listings (created_at desc);

alter table public.listings enable row level security;

create policy "Listings are readable by everyone"
  on public.listings
  for select
  to anon, authenticated
  using (true);
