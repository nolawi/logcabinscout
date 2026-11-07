# Property photos and source credits

The user requested property thumbnails for personal browsing, with Zillow,
Redfin, or the original MLS/brokerage listing as possible sources. No exact
photo URLs have been retrieved yet: those sites require network access in this
cloud environment. Existing listings retain their branded placeholders.

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
