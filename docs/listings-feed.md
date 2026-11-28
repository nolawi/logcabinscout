# Public listing feed

`public/listings.json` is generated from explicitly reviewed, sourced records.
The browser fetches it under Vite BASE_URL and uses the same parser for server
prerendering and live updates. The feed contains real properties, never sample
fallbacks. A request failure shows a refresh message; an empty feed shows an empty
collection. Invalid/unverified/duplicate records remain excluded.

## Retention and status

**Older listings are retained.** The former 30-day visibility expiry has been
replaced with status freshness labels. Valid UTC review dates are required and
future/invalid dates are rejected, but age alone never deletes a cabin.
The generator includes reviewed active, pending, sold, off-market, and unknown
records. Prices are last-known listing prices, not inferred closing prices.

`lastCheckedAt` is the fact-review time and never renewed by a status-only check.
`saleStatus`, `statusCheckedAt`, `statusCheckOutcome`, `statusCheckAttemptAt`, and
`statusSourceUrl` carry sale-status observations separately. Legacy rows use their
original review date until a specific status check is available. Active
confirmation becomes stale after 30 days; the browser recalculates each minute
and on focus/visibility changes. See [status command and rules](listing-status.md).

Cards retain original listing and verified Instagram links. Historical or stale
price facts are labeled “Last listed price.” Failed checks never mark a home sold.
No API keys or service credentials belong in the public feed or client bundle.

## Record requirements

Unique `id`, `title`, `location`, a nonnegative numeric `price`, valid HTTPS
`listingUrl`, `verified: true`, and a real UTC `lastCheckedAt` are required.
Optional acreage and home facts remain null when unknown. Beds are nonnegative
integers (zero is a studio), baths may be fractional, and square feet must be a
positive integer. Unknown values are not fabricated.

Optional `photo` metadata needs a supported URL, source URL, descriptive alt text,
credit, and valid intrinsic dimensions. Missing photos retain the card fallback;
they do not remove the listing. See [photo handling](property-photos.md).

Rebuild with `node scripts/build-listing-feed.mjs`. This deterministic operation
does not check live sources, reset dates, or deploy the website. Deploy status
model/client changes and their feed together to keep their behavior consistent.
