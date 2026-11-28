# Log Cabin Scout

A React + TypeScript + Vite website for discovering log cabins for sale.

## Project planning

See the [project plan and 20-item backlog](docs/project/backlog.md) for domain,
website/Instagram integration, brand, dashboard, automation, and marketing work.
A [Notion import CSV](docs/project/backlog-notion-import.csv) uses matching task IDs.
The [domain, brand and automation breakdown](docs/project/brand-domain-automation.md)
and [domain register](docs/project/domain-register.csv) track the permanent-domain launch.

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
Older properties stay visible with sale-status and freshness labels. Loading, unavailable-feed,
and empty-collection states never substitute fictional properties. Supabase has a
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
the browser updates freshness labels without removing older homes. See [feed details](docs/listings-feed.md).

The site deploys to **https://elancabin.com/** through GitHub Pages in this
repository. Pushes to `main` run build checks. Website deployment is manual so design
changes can be grouped into a release.
Vite uses the root base path `/`; `public/CNAME` records the custom domain.
`npm run deploy` requests a manual redeployment of remote `main` using GitHub CLI.
See [deployment details](docs/deployment.md).

Manage candidates, photos, and inactive listings with `npm run review -- --help`.
See the [local review workflow](docs/review-workflow.md).

The collection contains 49 reviewed properties across multiple states, including retained historical listings. See [expanded listing sources](docs/expanded-listing-sources.md).

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

Listings with confirmed post links offer a secondary “View on Instagram” link. See
[website–Instagram integration](docs/website-instagram.md) for mapping and release behavior.

Check sale status on demand with `npm run listings:status` (preview), or
`npm run listings:status -- --apply --limit 10` to save due checks.
See [status checking and retention](docs/listing-status.md). No deployment or
Instagram posting is triggered by this command.
