-- Log Cabin Scout — initial persistent listings schema.
-- Intended for Supabase PostgreSQL. Run through Supabase migrations after connecting a project.
create table if not exists public.cabin_listings (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_listing_id text not null,
  title text not null,
  description text,
  property_type text,
  address text,
  city text,
  state text not null,
  postal_code text,
  price_usd integer check (price_usd is null or price_usd >= 0),
  acreage numeric(12, 3) check (acreage is null or acreage >= 0),
  bedrooms numeric(4, 1) check (bedrooms is null or bedrooms >= 0),
  bathrooms numeric(4, 1) check (bathrooms is null or bathrooms >= 0),
  square_feet integer check (square_feet is null or square_feet >= 0),
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  listing_url text not null check (listing_url ~* '^https://'),
  image_urls text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'pending', 'sold', 'off_market')),
  is_verified_cabin boolean not null default false,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_source_update_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, source_listing_id)
);

create index if not exists cabin_listings_recent_active_idx
  on public.cabin_listings (first_seen_at desc)
  where status = 'active' and is_verified_cabin = true;

create index if not exists cabin_listings_state_idx
  on public.cabin_listings (state);

-- Public can only read verified active listings. No anonymous insert/update/delete access.
alter table public.cabin_listings enable row level security;
create policy "Public can view active verified cabins"
  on public.cabin_listings for select to anon, authenticated
  using (status = 'active' and is_verified_cabin = true);

-- Backend ingestion must run in a trusted environment using a service role,
-- never in the browser. Keep service-role credentials out of git.
