# Instagram drafts and publishing

The weekly **Prepare Instagram drafts** workflow creates two property-photo
spotlights from the live listing feed. Selection rotates weekly and prefers
different states. Only current, non-sample listings with sourced photos are used.
The feed URL is an internal data source, never promotional copy.

Post images contain only the property photograph. Location, address, price,
acreage, source credit and the original listing URL appear in the caption. Photos are downloaded over HTTPS and embedded for offline browser
rendering. Images preserve their full aspect ratio without cropping, added borders,
logos, text overlays, or watermark removal.
No temporary hosting domain appears on cards or in captions. Captions link to
the original Zillow, brokerage or other listing page and retain photo credits.
Instagram generally displays caption URLs as plain text, rather than clickable
links. The user reports MLS licenses and requested property-photo use; credits
remain attached and no universal license grant is inferred or stored.

Run locally:

```bash
npm run instagram:drafts
CHROMIUM_EXECUTABLE=/usr/bin/chromium python scripts/render-social-drafts.py
```

Outputs are ignored under `artifacts/instagram/`: HTML, JPEG, PNG, captions,
alt text and a draft manifest. The weekly workflow uploads these as a 30-day
artifact. Photos are downloaded by the generator; all browser network requests
are blocked during rendering. Python Playwright is pinned to 1.62.0 in CI.
A failed photo download stops generation instead of substituting artwork.

## Meta connection

The account is `logcabinscout`, Instagram ID `17841480907650824`. The repository
Actions secret `INSTAGRAM_ACCESS_TOKEN` holds the token; never paste it in chat
or commit it. New apps use Unified Login with a business portfolio.
**Check Meta connection** checks the exact ID and username using Instagram
Graph or Facebook Graph, without posting or logging raw responses or secrets.

## Manual publishing

**Instagram publishing** is manual only. Both `publish` and `prepare` default
to false. The default checks identity and publishing quota using Facebook Graph.
With `prepare: true`, a public HTTPS JPEG URL and matching caption, Meta creates
and processes an unpublished container. With `publish: true`, it also sends one
publish request after processing finishes. No publish request is retried.
Check Instagram before rerunning an ambiguous failure; manual reruns are not
deduplicated. There is no automatic posting schedule.

Public snapshots and their captions are under `public/social/instagram/`.
`latest.json` describes the latest prepared batch, not posting history.
Hash-based JPEG filenames are immutable; original text-card files remain for
historical references. Raw GitHub image URLs work without a site deployment.
Private Actions artifact URLs cannot be used by Meta. Publishing new snapshots
requires copying the rendered JPEGs and matching metadata into this directory.
Facts are snapshots and should be checked before posting.

The original test post used an illustration and temporary-domain copy. Changing
the generator does not edit or replace that existing Instagram post. New drafts
use property photographs and source-only captions. Website deployment remains
manual and independent from Instagram.

## Carousel posts

The manual publishing workflow accepts `image_urls`: a JSON array of 2–10
public HTTPS JPEG URLs. Prefer three distinct photographs from the same verified
property gallery; minimum two for new posts. Leave `image_urls` blank for the
legacy single-image option. The publisher validates every URL, processes each
child, creates the parent carousel, then publishes the parent exactly once.
Preparation mode stops before publishing. Original public provider JPEG URLs
can be used directly, so posting needs neither image commits nor a site deploy.
Keep source watermarks and photo credits. Listing captions put the original
listing URL on its own line, without a label or availability boilerplate.
The weekly draft generator still prepares single-photo previews; carousel gallery
selection happens when preparing the post, rather than inventing additional
photos or treating resolution variants as separate photographs.

## Four-slide editorial format

New posts use four slides in this order:

1. Strongest exterior with only location and price in white.
2. A different exterior angle.
3. Land, yard, or an exterior detail.
4. One unstaged interior photograph.

Only the cover has added typography. Its original photograph remains under a
separate text layer, with its aspect ratio and source watermark preserved.
No logo, website, box, or border is added. Caption conventions remain unchanged.
Do not select virtually staged interiors when an unstaged view is available.

Generate a cover from an already downloaded, verified source photograph:

```bash
node scripts/prepare-instagram-cover.mjs source.jpg 'Livermore, CO' 378000 cover.html
CHROMIUM_EXECUTABLE=/usr/bin/chromium python scripts/render-instagram-cover.py cover.html cover.jpg
```

Host the new cover at a public JPEG URL before dispatching the carousel. Original
provider URLs can be used for the other slides. The dated Snowmass manifest in
`public/social/instagram/2026-11-10-snowmass.json` records the sourced facts,
caption, photo origins, and slide order for the first four-slide post.
The weekly workflow still generates photo-only previews; final four-slide
selection and cover preparation use this documented editorial process.

Instagram profile icon/bio edits and deletion of old test posts remain manual
with the current connection. The attempted cleanup returned Meta error code 10;
no deletion was confirmed. Do not assume old posts have been removed.

### Current cover and caption styling

Cover text is white and centered horizontally in the lower part of the image:
location above price, with a subtle shadow. At 1280px image width, location uses
42px type and price uses 80px. The text block is centered at 78% of image height.
Browser checks verify position, fit, and image loading.
The original photograph, aspect ratio, and source watermark remain intact.

`buildInstagramCaption` is shared by weekly drafts and manually prepared posts.
It puts a short editorial headline first, then the bare listing URL on its own
line, followed by verified address/location, price and
acreage, followed by known beds/baths/square footage. Five relevant hashtags
include a state-specific real estate tag. Photo credit is the last line.
Unknown home facts are omitted. There is no temporary-domain promotion or
availability boilerplate. The publisher reads back a successful post's permalink
and child count when available; verification failure never retries publishing.

### Editorial headlines

Use an original, fact-based headline of roughly five words for each selected
property. Pass it as `buildInstagramCaption(row, { headline })`; a location-based
headline is used for weekly previews when no editorial title is supplied.
Headline text is one short line and precedes the unlabelled listing URL.
Do not imply amenities or property features without source evidence. The
Florence post uses “Off Grid With Bitterroot Views”, matching its live listing.
Earlier published posts and dated manifests retain their original formatting.

## Ready-to-post queue (fast path)

`data/instagram-plan.json` contains ten editorial selections: a fact-based
five-word headline and four manually reviewed gallery indexes per property.
`data/instagram-queue.json` contains rendered, public covers, captions, source
facts and the four selected photo URLs. Packages do not create Meta drafts or
containers, so there is no container expiry while waiting to publish.

```bash
npm run instagram:post -- --list
npm run instagram:post -- --check russellville-ky
npm run instagram:post -- russellville-ky
# Up to three in one explicitly requested batch:
npm run instagram:post -- boise-id jamestown-pa harrogate-tn
```

These commands dispatch **Publish prepared Instagram posts**. The workflow
only runs manually on main; its default is check-only. The publishing command rechecks each original
listing for active log-cabin status, matching price/home facts and selected
photo identities before dispatching. A changed source blocks the entire batch before publishing.
It checks both committed history and the account's recent 100 posts to avoid
repeats. Posts run sequentially under the same concurrency group as the legacy
manual publisher. No website deployment is needed.

`data/instagram-post-history.json` is the durable posting ledger. Before each
post, the workflow commits and pushes a `publishing` claim to main. After success
it records the media ID, permalink and timestamp; an ambiguous failure is marked
`needs-review` and blocks a blind rerun. A failure to persist the claim prevents
publishing. Receipt persistence failure stops the batch; the earlier remote
claim still blocks repeating that property. History commits use `[skip ci]`
because they change no application behavior. Receipts are also retained as an
Actions artifact for 90 days. The history does not expire with the artifact.

A `needs-review` entry must be reconciled against Instagram before resuming;
do not delete a claim merely to retry. The script never automatically retries
`media_publish`. Account deletion/profile editing remain separate manual tasks.
The legacy raw-URL publisher remains available; use this queue workflow for the
history and source checks described above.

To refresh one package after a listing changes:

```bash
CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run instagram:prepare -- russellville-ky
```

Omit the ID to refresh all unposted packages. This fetches public source pages,
renders covers with the existing Python Playwright installation, and writes the
queue and content-addressed JPEGs. Commit/push refreshed packages and new covers
before posting so their raw GitHub URLs resolve. Original gallery URLs serve the
other images directly. Refreshing packages never posts or deploys the site.
Keep source credits/watermarks and disclose material conditions (for example,
TLC, off-grid utilities, or seasonal access) in the prepared caption notes.

### Source checks run on the publishing client

Zillow rejects requests from GitHub Actions runners with HTTP 403. The
`instagram:post` command therefore performs the live source checks in the
publishing workspace before dispatch, and supplies a UTC verification timestamp
and SHA-256 checksum of the exact selected packages. The workflow requires that
checksum to match and the timestamp to be at most 30 minutes old (allowing up to
two minutes of forward clock skew). It does not retry blocked Zillow requests.
This is an attestation from an authorized publishing client, not a signature
from Zillow; repository dispatch access remains the authorization boundary.
Use the CLI instead of manually inventing these inputs in the Actions form.
Both check-only and publishing runs still check live Instagram history.
