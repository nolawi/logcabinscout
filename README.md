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

For GitHub Pages, the Vite base path is set to `/logcabinscout/`. Change this to `/` when moving to a custom domain.

Manage candidates, photos, and inactive listings with `npm run review -- --help`.
See the [local review workflow](docs/review-workflow.md).
