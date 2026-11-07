# Public listing feed

The frontend fetches `public/listings.json` through Vite's `BASE_URL` (so it also
works under a GitHub Pages project path).

Currently this file is `[]`. The home page therefore displays **fictional preview**
listings with a clear label. No real properties are included or implied.

## Future feed format

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
    "imageUrl": "https://example.com/authorized-photo.jpg",
    "verified": true
  }
]
```

The above is **schema documentation only**, not an actual property. An ingest process must
validate the cabin classification, the property is currently for sale, and that
original listing links and photo use are permitted.

The browser-side parser rejects records without `verified: true`, a valid HTTPS
listing URL, a title, location, nonnegative numeric price, and unique ID.
Missing/invalid photos do not prevent inclusion. In future, an automated server-side
job can generate this JSON from Supabase or a licensed source. Do not expose
RentCast or Supabase service-role credentials in this file or client bundle.
