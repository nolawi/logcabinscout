# From discovery to public listings

There are two deliberately distinct stages:

1. **Discover**: `scripts/rentcast-discover.mjs` queries a bounded sample from
   RentCast, enriches individual sale listings with architectural features,
   and produces a private GitHub Actions artifact for review. A county
   classification is *potential evidence*, not approval to publish.
2. **Publish**: `scripts/build-listing-feed.mjs` reads reviewed records in
   `data/reviewed-listings.json` and generates `public/listings.json`.

## Review fields

Each reviewed record must have:
- A stable string `id`, `title`, `location`, numeric `price`, and optional numeric `acreage`.
- An **actual HTTPS original listing URL** and, optionally, an image URL
  with appropriate display permission.
- `verified: true` only after confirming both actual log construction
  **and** that the property is for sale.
- `status: "active"` and a recent ISO timestamp `lastCheckedAt`.

Only reviewed, active listings checked in the last 30 days are published;
older/sold entries can remain in the source for history but are excluded
from the site. The published feed never includes API keys.

## Costs and controls

The discovery workflow is **manual only**, with one listing search and at
most three individual property-record lookups (maximum four requests) per run.
It is not a daily crawler or a nationwide coverage mechanism.

RentCast alone is insufficient to supply photos or original listing URLs.
Do not create fake direct-listing links; obtain links and image permissions
from a legitimate source before marking an item reviewed.

The sample UI remains until at least one valid reviewed listing is added.
