# Public listing feed

The frontend fetches `public/listings.json` through Vite's `BASE_URL` (so it also
works under a GitHub Pages project path).

The feed initially contains three manually reviewed Virginia listings. Their review
is not continuous status verification; original listing pages remain authoritative.

The generator retains valid review dates, even for old records, so its output and
CI consistency checks do not change with the build date. The browser rejects
future dates and hides listings at age **30 days or older**, using the visitor's
clock. It recalculates every minute and on tab visibility/focus changes, so an open
page also expires records. Review dates remain in the feed for background expiry checks and are not shown on cards.

A successful empty feed (including all-expired records) shows “No current listings.”
A failed request or malformed feed envelope shows a refresh message. Loading never
shows sample properties. Fictional examples are not used as a production fallback.

## Feed format

Only verified, active, authorized listing records should be included:

```json
[
  {
    "id": "rentcast:example-id",
    "title": "Example log cabin",
    "location": "Example Town, VA",
    "price": 350000,
    "acreage": 4.2,
    "propertyType": "Log cabin",
    "listingUrl": "https://example.com/original-listing",
    "verified": true,
    "lastCheckedAt": "2026-11-07T12:00:00.000Z"
  }
]
```

The above is **schema documentation only**, not an actual property. An ingest process must
validate the cabin classification, the property is currently for sale, and that
original listing links and photo use are permitted.

The browser-side parser rejects records without `verified: true`, a valid HTTPS
listing URL, a title, location, nonnegative numeric price, and unique ID.
A valid UTC ISO `lastCheckedAt` timestamp is required; missing, invalid, future, and expired dates are excluded.
Optional `photo` metadata must include authorized imagery, descriptive alt text,
credit, source link, and intrinsic dimensions. Attribution and source links are preserved without asserting that they establish a usage license. Bare `imageUrl` fields are ignored.
See [photo permissions and responsive assets](property-photos.md).
Missing/invalid photos do not prevent inclusion. In future, an automated server-side
job can generate this JSON from Supabase or a licensed source. Do not expose
RentCast or Supabase service-role credentials in this file or client bundle.

Optional numeric `bedrooms`, `bathrooms`, and `squareFeet` fields are carried
through the reviewed source, generated feed, and cards. Unknown values stay null
and are omitted visually; fractional bathroom counts and zero-bedroom studios
are retained. Square footage must be a positive integer measured in square feet.
