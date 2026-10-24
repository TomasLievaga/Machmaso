-- Let signed-in users create listings that they own.
-- Existing sample listings keep author_id = null and belong to no user.

alter table public.listings
  add column author_id uuid references auth.users (id) on delete cascade;

create index listings_author_id_idx on public.listings (author_id);

-- Users now write these columns, so bound them like the other text fields.
alter table public.listings
  add constraint listings_author_name_length
    check (char_length(author_name) between 1 and 40),
  add constraint listings_offer_length
    check (offer is null or char_length(offer) between 1 and 500),
  add constraint listings_wanted_length
    check (wanted is null or char_length(wanted) between 1 and 500);

-- Supabase grants anon and authenticated every table privilege by default
-- (including UPDATE, DELETE and TRUNCATE, which RLS does not cover).
-- Reduce that to what the app needs; RLS policies still apply on top.
revoke all on table public.listings from anon, authenticated;
grant select on table public.listings to anon, authenticated;
-- id and created_at always come from their defaults.
grant insert (
  title, description, intention, category, neighborhood, lat, lng,
  author_name, availability, compensation, amount, unit, offer, wanted,
  author_id
) on table public.listings to authenticated;

create policy "Authenticated users can create their own listings"
  on public.listings
  for insert
  to authenticated
  with check (author_id is not null and author_id = (select auth.uid()));

-- Abort if any other policy could still allow inserts.
do $$
begin
  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'listings'
      and cmd in ('INSERT', 'ALL')
      and policyname <> 'Authenticated users can create their own listings'
  ) then
    raise exception 'Unexpected INSERT policy on public.listings; review it before applying this migration.';
  end if;
end
$$;
