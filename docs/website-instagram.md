# Website and Instagram listing links

The website joins `data/instagram-post-history.json` to the existing listing feed
by exact `listingId` / `id`. Only `published` records with an HTTPS Instagram
`/p/` or `/reel/` permalink are included. Pending, failed, malformed, and old
media-ID-only records remain unlinked; no permalink is guessed. If there are
multiple confirmed entries, the last valid ledger entry wins.

`src/lib/instagram.ts` validates the public links and joins them to the current
listings without mutating the feed or introducing history-only properties.
The source-validation rules still apply; older homes now stay visible with status labels. Instagram records
never renew a property's review date or override its price or sale source.

Cards keep the original source links and add a secondary “View on Instagram”
link. There is no Instagram-only filter or promotional badge. Existing search,
state, price, sort and saved controls continue to operate on the whole collection.

The history is read at build time, shared by prerendering and client rendering.
New post links appear on the website after the next manual website build/deploy;
posting to Instagram alone does not redeploy the website. No Meta requests,
tokens, database connection, or account management are needed in the browser.

Validation: 104 unit tests, production build/SEO checks, and desktop browser checks
covering all 49 retained listings and 37 linked listings, combined filters, saved
items, sorting, clear/reset, empty intersections, safe links, and hydration.
Three legacy published-property entries have no permalink and are excluded.

Release status: implemented on main; website deployment remains manual.

November 28 refinement: removed the Instagram-only filter at the owner’s request;
keep the integration to simple card links.
