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
  with appropriate display permission recorded in a `photo` object; see
  [property photography](property-photos.md).
- `verified: true` only after confirming both actual log construction
  **and** that the property is for sale.
- `status: "active"` and a recent ISO timestamp `lastCheckedAt`.

The generated feed includes reviewed, active records with valid UTC ISO review dates.
Generation is deterministic, including for old records. The browser displays only
records younger than 30 days and excludes future dates. Sold entries are excluded
at generation. Review dates must reflect actual source checks, never automatic renewal.
The feed never includes API keys. See [freshness behavior](listings-feed.md).

## Costs and controls

The discovery workflow runs weekly and can also be triggered manually, with one listing search and at
most three individual property-record lookups (maximum four attempts, including
failures, with no retries) per run. All 50 states rotate over 50 weeks;
weekly sampling and duplicate-address filtering are described in
[scheduled discovery](scheduled-discovery.md).
It is not a daily crawler or a nationwide coverage mechanism.

RentCast alone is insufficient to supply photos or original listing URLs.
Do not create fake direct-listing links; obtain links and image permissions
from a legitimate source before marking an item reviewed.

An empty or expired collection shows no current listings; production never falls back to fictional properties.


Discovery history now retains classification results and candidate observations
between runs. See [history retention and limitations](scheduled-discovery.md#retained-discovery-history).
This history never grants approval for publication or updates the public feed.
