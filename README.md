# Log Cabin Scout

A React + TypeScript + Vite website for discovering log cabins for sale.

## Run locally

```bash
npm ci
npm run dev
```

## Build

```bash
npm run build
```

The homepage reads a reviewed JSON feed, initially sourced from three Virginia properties.
Only listings checked less than 30 days ago are displayed. Loading, unavailable-feed,
and no-current-listings states never substitute fictional properties. Supabase has a
schema but is not connected to the app.

## Tests and listing updates

Use Node 22.6 or newer (CI uses Node 22) for the native TypeScript test runner.

```bash
npm test
node scripts/build-listing-feed.mjs
npm run build
```

Update `data/reviewed-listings.json` only after checking the original sale source.
Never advance `lastCheckedAt` solely to keep a listing visible. Regenerate and commit
`public/listings.json` when reviewed data changes. Generation is deterministic;
the browser enforces expiry without a redeployment. See [feed details](docs/listings-feed.md).

The site deploys to **https://elancabin.com/** through GitHub Pages in this
repository. Pushes to `main` run build checks. Website deployment is manual so design
changes can be grouped into a release.
Vite uses the root base path `/`; `public/CNAME` records the custom domain.
`npm run deploy` requests a manual redeployment of remote `main` using GitHub CLI.
See [deployment details](docs/deployment.md).

Manage candidates, photos, and inactive listings with `npm run review -- --help`.
See the [local review workflow](docs/review-workflow.md).

The collection now includes 37 sourced properties across Virginia, Tennessee, Colorado, North Carolina,
Pennsylvania, Montana, West Virginia, Georgia, Kentucky, and Idaho. See [expanded listing sources](docs/expanded-listing-sources.md).

Production builds prerender the collection and generate crawl metadata for search
engines. See [SEO and sharing](docs/seo.md).

Use card hearts and **Saved only** to shortlist properties in your browser.
See [saved cabins](docs/saved-cabins.md) for persistence behavior.

For keyword-targeted discovery without paid API calls, see
[public listing discovery](docs/public-discovery.md). Cards include sourced
bedroom, bathroom, and square-footage details where available.

A free-first weekly Instagram draft workflow creates two branded property-photo cards
with captions; see [Instagram drafts](docs/instagram.md). It does not publish posts.

Prepared Instagram posts can be listed with `npm run instagram:post -- --list`
and published by queue ID with `npm run instagram:post -- <id>`. The publishing
command rechecks listing facts, and the workflow records history to prevent repeats;
see [queue instructions](docs/instagram.md#ready-to-post-queue-fast-path).
