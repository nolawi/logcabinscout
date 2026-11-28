# Log Cabin Scout — Brand Guide

## Creative direction
An independent American cabin-scouting field guide: warm, considered,
slightly nostalgic and editorial. Inspired by vintage nature guides and
historic real-estate publications, not a reproduction of another site's branding.

## Brand assets

The [SVG kit and upload exports](../public/brand/README.md) follow the selected
profile design: a parchment cabin with heavy log courses, a chimney and a rust
door on pine. Use the square avatar for the Instagram profile, the horizontal
lockup for standalone placements, and the tight favicon for browser tabs.
Keep the mark clear of the edge when cropping the avatar to a circle.

The site header uses the mark with live Playfair Display text. The standalone
lockup and social preview use outlined Georgia lettering for portability across
SVG editors and browsers. The social preview is exported as a PNG for sharing.

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

## Positioning and voice
Discover distinctive log cabins and log homes across the United States, with
original listing links.

Suggested Instagram bio: Log cabins & log homes across the U.S. · Original listing links.

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

- Muted parchment, sage, and pine-tinted photo panels reuse the cabin mark.
  Visible text identifies missing or unavailable photos; artwork never depicts a property.
- Loading photos keep the panel in place. Failed images are removed and replaced
  with the branded fallback. Changing the image URL resets photo loading.
- Inline SVG arrows use the surrounding text color and are hidden from assistive
  technology; link text supplies their accessible names.
- Secondary text uses darker ink for contrast. Filter-reset controls have a 44px minimum height;
  card photos and addresses provide direct links to the property.
- The compact header uses a small emblem, single-line wordmark and Instagram link. Heading wrapping and reduced-motion support remain available.

## Minimal browsing layout

The visible page opens on filters and property cards, with one result count.
Editorial introductions, story copy, repeated property-type labels, and visible
review dates are omitted. A screen-reader heading and background freshness
filtering remain; image source credits stay visible.

Property photos and addresses link directly to the original listing. Price and
acreage share a compact row; a separate repeated listing CTA is omitted.
Photo credits retain separate source links.

Filters use a single unboxed toolbar with descriptive selected values and
screen-reader labels. The result count is compact and stays in place when the
clear-filters control appears.
