# Search and sharing

The canonical homepage is `https://elancabin.com/`. The title and description
identify the site as a curated log-cabin-for-sale collection without claiming
complete nationwide coverage. Open Graph and Twitter metadata reference the
1200×630 branded `public/social-card.png` preview. No analytics or paid SEO service
is required.

## Static HTML and client behavior

`npm run build` runs Vite, then `scripts/prerender-site.mjs`. Prerendering uses
the existing React app and validated current feed to put the actual collection
into `dist/index.html`. Crawlers and JavaScript-disabled browsers receive real
property titles, prices, locations, photos, and source links rather than an empty
root. The visible minimal design is unchanged; its accessible page heading remains.

A safely escaped JSON snapshot lets React hydrate that same markup. On mounting,
the client rechecks freshness using the visitor's clock, fetches the current feed,
and retains the usual search/filter/sort behavior. Schema updates when listings
expire or the feed fails, rather than advertising hidden expired records to
JavaScript-capable crawlers. Snapshot JSON and JSON-LD escape HTML-sensitive text.

Static HTML is a release-time snapshot: it does not update by itself. Regenerate
and redeploy when the collection changes, including when entries expire. The
browser's existing 30-day expiry still applies between deployments; a crawler
that never runs JavaScript can see the last deployed snapshot until a new release.

## Crawl files and structured data

The build emits:

- `robots.txt`, allowing public pages and pointing to the sitemap.
- `sitemap.xml`, listing the canonical homepage only. Filter combinations and
  external listing pages are not invented as local URLs.
- `WebSite` and `CollectionPage`/`ItemList` JSON-LD describing the source-linked
  collection. This does not claim Google rich-result eligibility or create
  unsupported product offers or ratings.

`scripts/check-seo.mjs` runs as part of every production build and checks metadata,
static card/snapshot/schema counts, crawl files, and social preview dimensions.
Unit tests cover safe JSON embedding and accurate structured-data output.

## After deploying

Check `/robots.txt`, `/sitemap.xml`, and page source on the live domain. Use Google
Search Console to verify a domain or URL-prefix property and submit
`https://elancabin.com/sitemap.xml`. Inspect the homepage URL and request indexing.
Domain verification requires access to the domain's DNS settings; a URL-prefix
property can instead use a supplied verification HTML file or meta tag. Do not
invent a verification token or add one until Google supplies it.

Search Console and search-engine indexing have not been configured by this code
change. Indexing and rankings are controlled by search engines. Future source
pushes remain separate from the site's manual deployment workflow.
