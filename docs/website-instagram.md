# Website and Instagram listing links

The website joins `data/instagram-post-history.json` to the existing listing feed
by exact `listingId` / `id`. Only `published` records with an HTTPS Instagram
`/p/` or `/reel/` permalink are included. Pending, failed, malformed, and old
media-ID-only records remain unlinked; no permalink is guessed. If there are
multiple confirmed entries, the last valid ledger entry wins.

`src/lib/instagram.ts` validates the public links and joins them to the current
listings without mutating the feed or introducing history-only properties.
The existing source checks and 30-day expiry still apply. Instagram records
never renew a property's review date or override its price or sale source.

Cards keep the original source links and add a secondary “View on Instagram”
link. “As seen on Instagram” combines with search, state, maximum price, sort,
and Saved only. Clear filters resets both toggles. Empty intersections show an
explanation and the clear action remains available.

The history is read at build time, shared by prerendering and client rendering.
New post links appear on the website after the next manual website build/deploy;
posting to Instagram alone does not redeploy the website. No Meta requests,
tokens, database connection, or account management are needed in the browser.

Validation: 104 unit tests, production build/SEO checks, and desktop browser checks
covering all 49 current listings and 37 linked listings, combined filters, saved
items, sorting, clear/reset, empty intersections, safe links, and hydration.
Three legacy published-property entries have no permalink and are excluded.

Release status: implemented on main; website deployment remains manual.
