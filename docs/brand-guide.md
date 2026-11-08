# Log Cabin Scout — Brand Guide v1

## Creative direction
An independent American cabin-scouting field guide: warm, considered,
slightly nostalgic and editorial. Inspired by vintage nature guides and
historic real-estate publications, not a reproduction of another site's branding.

## Brand assets
- `public/logo-mark.svg` — illustrated circular log cabin / forest emblem.
- `public/favicon.svg` — simplified, high-contrast mark for small tabs.
- `public/hero-landscape.svg` — original mountain-and-pine illustration.
- These are original vector assets; no stock listing photos are included.

## Palette
| Token | HEX | Usage |
| --- | --- | --- |
| Pine | `#243E32` | Headings, navigation, footer |
| Paper | `#F6F0E4` | Warm page background |
| Rust | `#A75139` | Calls-to-action, asking prices |
| Goldenrod | `#C7A86B` | Accent / cabin illustration |
| Charcoal | `#252821` | Primary body text |

## Typography
- Display: Playfair Display, with Georgia as offline fallback.
- UI and body: DM Sans, with Arial/system fallback.
- Fonts load from Google Fonts when online; app remains readable when offline.

## Voice
Grounded, warm, curated. Use “Cabins worth the hunt,” “The scouted collection,”
and “Find your place in the woods.” Avoid claiming nationwide completeness.

## Listing imagery
The homepage opens directly on the listing collection, with compact typography
and no promotional hero. The original landscape asset is retained for future use.
Listing cards use
source-linked property photographs where supplied, with neutral placeholders
for missing or failed images. See [photo sources](property-photos.md).
Do not replace placeholders with unrelated pictures or imply stock photos depict
the actual home.

## Implementation
All core color and type tokens are CSS custom properties in
`src/styles/main.scss`. Existing state/price filters and original listing links
are preserved. GitHub Pages base URL is respected for brand assets.

## Card presentation and accessibility

- Muted parchment, sage, and pine-tinted photo panels reuse the original logo.
  Visible text identifies missing or unavailable photos; artwork never depicts a property.
- Loading photos keep the panel in place. Failed images are removed and replaced
  with the branded fallback. Changing the image URL resets photo loading.
- Inline SVG arrows use the surrounding text color and are hidden from assistive
  technology; link text supplies their accessible names.
- Secondary text uses darker ink for contrast. Listing links and filter-reset
  controls have 44px minimum touch heights; cards align links along the bottom.
- Heading wrapping, a stacked header below 360px, and reduced-motion support keep
  the layout readable on narrow screens and with fallback fonts.
