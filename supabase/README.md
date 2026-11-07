# Database foundation

This folder contains the schema for Log Cabin Scout, designed for Supabase PostgreSQL.

## Initial table: `public.cabin_listings`

- One row per listing per provider, uniquely identified by `(source, source_listing_id)`.
- Structured location, price, land, home details, optional images, and original listing URL.
- `first_seen_at` and `last_seen_at` for scheduled discovery and deduplication.
- `status` keeps sold and off-market records in the database.
- `is_verified_cabin` prevents uncertain matches appearing publicly.

## Security

Row-level security allows public reads **only** for active, verified listings.
No browser/user write policy is configured. Scheduled ingestion should use a
trusted server-side service credential, never a frontend environment variable.

## Next steps

1. Create a Supabase project when ready.
2. Apply migrations through the Supabase CLI or SQL editor.
3. Choose a property data provider, and verify its terms allow storing and displaying
   listing details/photos and linking to the originating source.
4. Build a server-side ingestion job with upsert/deduplication.
5. Connect the React UI with the Supabase public URL and publishable key.

There is **no live database connected** at this stage. The UI currently reads manually reviewed real listings from a static JSON feed.
