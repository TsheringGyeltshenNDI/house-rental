-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.

-- ---------------------------------------------------------------------------
-- Listings
-- ---------------------------------------------------------------------------
create table if not exists public.listings (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade default auth.uid(),
  title       text not null check (char_length(title) between 5 and 120),
  description text check (char_length(description) <= 3000),
  dzongkhag   text not null,
  location    text not null check (char_length(location) between 2 and 200),
  rent        integer not null check (rent > 0),
  bedrooms    smallint not null check (bedrooms >= 0),
  phone       text not null check (char_length(phone) between 6 and 20),
  images      text[] not null default '{}' check (cardinality(images) <= 8),
  status      text not null default 'available' check (status in ('available', 'rented')),
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '30 days'
);

create index if not exists listings_browse_idx
  on public.listings (status, expires_at, created_at desc);
create index if not exists listings_owner_idx on public.listings (owner_id);

alter table public.listings enable row level security;

-- Everyone (even logged-out visitors) sees available, unexpired listings.
-- Owners always see their own listings, including rented/expired ones.
drop policy if exists "listings are viewable" on public.listings;
create policy "listings are viewable" on public.listings
  for select using (
    (status = 'available' and expires_at > now())
    or owner_id = auth.uid()
  );

drop policy if exists "logged-in users can post" on public.listings;
create policy "logged-in users can post" on public.listings
  for insert to authenticated with check (owner_id = auth.uid());

drop policy if exists "owners can update" on public.listings;
create policy "owners can update" on public.listings
  for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "owners can delete" on public.listings;
create policy "owners can delete" on public.listings
  for delete to authenticated using (owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Reports (fake / spam / already rented)
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id          bigint generated always as identity primary key,
  listing_id  uuid not null references public.listings (id) on delete cascade,
  reason      text not null check (char_length(reason) between 3 and 500),
  created_at  timestamptz not null default now()
);

alter table public.reports enable row level security;

-- Anyone can file a report; nobody can read them through the API.
-- Review reports in the Supabase dashboard (Table Editor → reports).
drop policy if exists "anyone can report" on public.reports;
create policy "anyone can report" on public.reports
  for insert with check (true);

-- ---------------------------------------------------------------------------
-- Photo storage
-- Files are stored as <user id>/<random name>.jpg so each user can only
-- upload to and delete from their own folder.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images', 'listing-images', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "users upload to own folder" on storage.objects;
create policy "users upload to own folder" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users delete own photos" on storage.objects;
create policy "users delete own photos" on storage.objects
  for delete to authenticated using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
