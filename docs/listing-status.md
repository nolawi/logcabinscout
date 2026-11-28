# On-demand listing status and retained homes

Ask Codex to “check listing statuses” to run the existing command. No scheduler,
paid API, database, or credentials are needed. The command never deploys the site
or posts to Instagram. It uses original public Zillow pages, not search snippets.
Other source types return **unconfirmed** until an adapter is implemented.

```sh
# Preview up to ten due records (not attempted in the last seven days):
npm run listings:status
# Check and apply a small batch; preserve the report and audit history:
npm run listings:status -- --apply --limit 10
# Process a state or exact properties (explicit IDs bypass the due interval):
npm run listings:status -- --state VA --limit 10
npm run listings:status -- --apply --id zillow:22573204
# Up to 100 per run; --days 0 includes recently attempted records:
npm run listings:status -- --apply --days 0 --limit 100
```

Preview is the default. `--apply` saves reviewed records, the regenerated public
feed, and `data/listing-status-history.json`. It uses the review tool's shared
lock, checks for source changes, stages file writes, and rolls back on errors.
The report is always written to ignored `artifacts/listing-status-report.json`.
There is no automatic retry. Failed attempts are not retried until due, unless
explicit IDs or `--days 0` are requested. Limits and serial fetching bound traffic;
identical URLs are fetched only once per run.

Every supported page must match the known Zillow property ID. Supported explicit
statuses become `active`, `pending`, `sold`, or `off_market`. FOR_SALE paired with
an explicit under-contract status becomes pending. Conflicts, unrecognized
statuses, missing pages, 403s, timeouts, malformed data, and unsupported sources
remain unconfirmed. Missing pages never imply a sale. No source sale date is
invented; the checker currently records the observation time, not `soldAt`.

Confirmed results update sale status, status-check time, source URL, and evidence.
Changed states append an audit event; unchanged confirmations still record an
attempt. A repeated identical result is idempotent; older results cannot overwrite
newer attempts. Unconfirmed attempts retain previous confirmed status/evidence
and record the failure separately. **Prices, facts, photos, lastCheckedAt, and
Instagram history are untouched.**

## Website behavior

Reviewed records remain in the feed even when old, pending, sold, or off market.
The browser still rejects malformed/future review dates and unreviewed records.
Age alone changes the status label, not inclusion. Legacy records use the original
fact-review date until the first status check; active status is “recently confirmed”
for 30 days. A failed latest check makes active availability unconfirmed. Sold,
pending, and off-market homes retain their explicit historical labels.

Cards display For sale / Pending / Sold / Off market / Status unconfirmed, and
label prices “Last listed price” for historical/unconfirmed homes or stale price
facts. A status-only check does not renew price verification. Counts distinguish
all browsable homes from recently confirmed for-sale homes. Page metadata covers
both for-sale and past listings; schema list items carry status labels and do not
invent offers. Existing source links, Instagram links, search, sorting, and saves
remain available. The draft generator excludes known non-active/unconfirmed homes;
manual Instagram publishing keeps its independent live source checks.

Deployment remains manual. New status fields require deploying this client version
alongside its generated feed; do not publish a status-enabled feed to an older
client independently.

## Validation and initial trial

Unit and CLI fixtures cover explicit statuses, unknown/conflicting sources,
identity mismatch, idempotency, preservation of dates/prices, transaction rollback,
batch/due limits, retained historical records, labels, and draft exclusion.
A three-property live trial on November 28, 2026 confirmed Harpers Ferry pending,
Greenbush active, and Floyd active. Its evidence is committed in the audit ledger.
Only those three records were status-checked; the remaining collection was not
bulk reverified. Website deployment has not been run.
