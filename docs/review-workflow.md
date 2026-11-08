# Local listing review

Use `npm run review -- --help` from the repository. The tool works with existing
JSON files and makes no network or paid API calls. No admin server or database is
required. Every change previews by default; `--write` saves the reviewed source
and regenerates the public feed. It does not commit, push, or deploy changes.

## Inspect the collection and candidates

```bash
npm run review -- list
npm run review -- queue artifacts/candidates.json
npm run review -- queue artifacts/history.json
```

Both the discovery candidate artifact and retained history artifact are supported.
Download either from a completed discovery run's GitHub Actions page into
`artifacts/`. The queue shows classification and any existing reviewed ID, and
counts candidates still awaiting review. Already-reviewed candidates are recognized
even when a custom MLS ID was assigned during approval.

## Approve a candidate

Create a local details file, for example `artifacts/review-details.json`:

```json
{
  "id": "mls:YOUR-ID",
  "title": "The property street address",
  "location": "City, State",
  "price": 250000,
  "acreage": null,
  "listingUrl": "https://example.com/original-listing",
  "lastCheckedAt": "2026-11-07T12:00:00Z"
}
```

The timestamp above is only an example. Supply the actual review time in UTC;
it is never generated or renewed by the tool. A candidate does not supply its
own approval date. Price, location, and title default from the candidate if omitted;
source URL and review date must be supplied. A custom ID is optional. Approval
marks the reviewed record active and verified and stores its original discovery ID.

```bash
npm run review -- approve artifacts/candidates.json CANDIDATE_ID artifacts/review-details.json
npm run review -- approve artifacts/candidates.json CANDIDATE_ID artifacts/review-details.json --write
```

Inspect the preview's `reviewed` and `feed` results before saving. Duplicate
approvals are rejected; use `update` for an existing reviewed record.

## Edit source links, prices, or photos

Use a details file containing only fields to change. Supported fields are `title`,
`location`, `price`, `acreage`, `listingUrl`, `lastCheckedAt`, and `photo`.
Photo format and source-credit guidance are in [property photos](property-photos.md).
Set `photo` to `null` to remove an image. Updating a photo or price does not
implicitly renew `lastCheckedAt`. Unknown fields are rejected to catch typos.

```bash
npm run review -- update REVIEWED_ID artifacts/review-details.json
npm run review -- update REVIEWED_ID artifacts/review-details.json --write
```

## Remove inactive properties from the feed

```bash
npm run review -- status REVIEWED_ID sold --write
npm run review -- status REVIEWED_ID pending --write
npm run review -- status REVIEWED_ID off_market --write
```

Inactive records remain in the reviewed source for history, with their existing
review dates. Omit `--write` to preview. IDs containing spaces must be quoted.

Writes are serialized with `artifacts/review.lock`, and files are staged before
replacement. If replacing the feed fails, the reviewed source is restored. A
stopped process may leave a lock: remove it only after confirming no review process
is running. Source changes made while a review is preparing are detected.

Finally run `npm test` and `npm run build`, inspect `git diff`, then commit the
reviewed source and regenerated feed together. Discovery results remain separate
from public listings until an explicit approval command is saved.
