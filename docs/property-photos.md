# Property photos and source credits

The three initial listings now have exterior photographs linked from their source
sites for the user's personal browsing. Images remain remotely hosted, with linked
source credits. They are displayed uncropped, and credit captions sit beneath the
image so embedded MLS watermarks remain visible.

| Property | Image source | Match evidence |
| --- | --- | --- |
| 295 Douglas Road | Bright MLS via Northrop Realty | Original listing page, MLS VALA2010884 |
| 20420 Out Of Bounds Drive | TVRMLS via Realtor Josh | Original listing page, MLS 10001316 |
| 206 Pottery Drive | Zillow listing photo | Zillow page title includes the address and MLS 112401 |

The exact source-page and image URLs, alt text, credits, and measured dimensions
are stored in `data/reviewed-listings.json`. No local copies or resized derivatives
are committed. Source credits identify provenance, not a newly obtained license.
External hosts may remove images or restrict embedding; the existing fallback
handles failed loads. Listing verification timestamps were not changed by adding photos.

## Add an exact property match

Use the street address and MLS number in `data/reviewed-listings.json` to verify
that a source page depicts the same property. Do not substitute a similar cabin,
stock image, or invented thumbnail URL. Record the source listing link and the
credit supplied with the photo. A credit identifies provenance; it does not claim
a usage license. Keep any private permission correspondence outside this public
repository. For public distribution, obtain the required display permissions.

Add a `photo` object to a reviewed listing. This is a schema example, not an
actual property image:

```json
{
  "url": "https://source.example/exact-property-thumbnail.jpg",
  "alt": "Front exterior of the listed log home",
  "credit": "Credit from the photo source",
  "sourceUrl": "https://source.example/exact-property-listing",
  "width": 960,
  "height": 640,
  "allowCropping": false,
  "variants": []
}
```

Required fields are a valid image URL, descriptive alt text, source credit,
HTTPS source page, and actual intrinsic dimensions. Incomplete photo metadata
omits the image without removing the listing. Bare `imageUrl` fields are ignored;
use `photo` to preserve attribution. Only the explicit display fields enter the
feed; unknown fields and private correspondence are not copied.

## Responsive images

Use source-provided thumbnail sizes where available. Put actual URLs and widths
in `variants`, for example `{ "url": "https://source.example/photo-small.jpg", "width": 480 }`.
Do not guess URLs by rewriting provider paths. The browser selects the appropriate
size for the card and pixel density, and images load lazily with intrinsic dimensions.

For photos we are permitted to store and resize, export WebP or AVIF at 480,
960, and 1440 pixels wide, without upscaling. Preserve aspect ratio, required
watermarks, and credits. Visually check quality and file sizes. Store those exports
under `public/images/properties/`, with variant URLs such as
`/images/properties/PROPERTY-480.webp`; Vite's project base is added automatically.
Set `allowCropping: true` only when appropriate; otherwise the whole image is shown.
No third-party resize proxy or paid service is required.

After adding photos, run `npm test`, regenerate with
`node scripts/build-listing-feed.mjs`, and run `npm run build`. Inspect the actual
photos and linked credits on desktop/mobile. Failed images keep their original
listing links and fall back to the branded placeholder. Remove withdrawn photos
and regenerate the feed when needed.

The expanded Tennessee and Colorado collection also uses source-linked photos
from the corresponding Zillow listing galleries, with measured dimensions and
MLS/provider credits. See [expanded listing sources](expanded-listing-sources.md).
