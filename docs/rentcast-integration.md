# RentCast integration — phase 1

## What this branch adds

A **manual, single-request diagnostic** for the official RentCast sale listings API.

- Uses GitHub Actions secret `RENTCAST_API_KEY`. Never commit API keys.
- Fetches at most 500 active, recently listed single-family properties in one selected state.
- Prints only the count and coverage caveats, not the raw property records.
- Does **not** automatically run daily or write to Supabase.
- No source listing URLs or photos are fabricated.

## Why no cabin ingestion yet?

RentCast's published **sale-listings response** includes price, address, type, lot size and other structured attributes, but not a listing description, public listing URL, photos, or reliable log-cabin classification. Filtering the response by `propertyType=Single Family` is **not** enough to identify log cabins. We must establish a legal, reliable enrichment/verification source before publishing or saving records as verified cabins.

The API is searched **by state, city, zip, or radius**. A single request does not cover all US states; scanning multiple states would consume multiple requests. The free Developer plan includes 50 requests per month and charges for overages.

## To activate after rotating the exposed key

1. Add the new RentCast key as the repository Actions secret `RENTCAST_API_KEY` at `https://github.com/nolawi/logcabinscout/settings/secrets/actions`.
2. Go to Actions > RentCast connection test > Run workflow and choose a state.
3. Review the run's record-count summary (one request spent).

## References

- https://developers.rentcast.io/reference/sale-listings
- https://developers.rentcast.io/reference/property-listings-schema
- https://developers.rentcast.io/reference/billing-and-pricing
