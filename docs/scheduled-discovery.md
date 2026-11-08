# Scheduled RentCast discovery

The GitHub Actions workflow `.github/workflows/rentcast-discover.yml`
runs every **Monday at 12:17 UTC** and can also be triggered manually.

## Cost controls

- Each run issues at most **4 attempted RentCast requests** (one sale search,
  up to three property-record lookups).
- A Monday-only schedule gives **4–5 runs per calendar month**, or
  approximately **16–20 attempted requests/month** if all lookups are made. Failures consume the run budget, with no automatic retries.
- This is deliberately below the advertised free Developer allowance
  (50 requests/month) but is NOT a strict account-wide quota guarantee.
  Manual executions, other apps/scripts, re-runs, and billable usage
  elsewhere can still exceed it. RentCast does not enforce hard spend caps.
- No key configured? The job skips the API call and reports a notice.
- The workflow does not publish candidate properties or update the site.

## Geographic sampling

Scheduled runs rotate through all 50 US states, one state per UTC week.
Manual runs can select any of those states. At the current weekly rate, a full
rotation takes **50 weeks**. Only listings from the last seven days are sampled:
this leaves large coverage gaps and is not a nationwide listing inventory.

From at most 100 returned sale listings, the script removes duplicate/empty
addresses and deterministically selects at most three for property enrichment.
Weekly hashing varies selection instead of always checking the first three;
it does not favor cabin construction or increase the provider's search coverage.

**Caution:** Sampling only three properties in a state is unlikely to find
a log cabin. This does not establish nationwide coverage or a production-ready
discovery system. The next research milestone is finding a suitable listings
source with architectural-style/description search and permitted photos.

## Output

If a key is configured, the workflow stores a **review-only**
`rentcast-candidates-STATE` GitHub Actions artifact for 30 days.
A human or licensed automated verifier must confirm log construction, active
sale status, original listing URL, and photo permissions before any record
can enter `data/reviewed-listings.json`.

Never use an API key in the frontend or commit it to the repository.
Configure the `RENTCAST_API_KEY` GitHub Actions secret if enabling live discovery.

Docs: https://developers.rentcast.io/reference/billing-and-pricing

## Local validation without API charges

Run `node --test scripts/lib/discover.test.mjs scripts/lib/discovery-schedule.test.mjs`.
These tests inject simulated provider responses and never use network or API keys.
They cover weekly selection, duplicate addresses, all-state rotation, request
failures, concurrent budget enforcement, response validation, and review-only output.

The four-attempt limit is per script process. It is not an account-wide spending
cap: the separate probe, manual reruns, and other consumers use their own budget.
Provider-level cabin search remains future work.


## Retained discovery history

The workflow restores `rentcast-discovery-history` from the newest retained
artifact of this workflow on `main` (including failed runs with saved progress).
It ignores artifacts from other branches, workflows, or pull request events.
Manual discovery is restricted to `main` so feature branches cannot write the
shared history. Runs are serialized by the existing concurrency group.

Successful property classifications, including negative matches, are reused for
90 days. The sale search still runs, and candidates use its current price and
listing fields. Reuse does not refresh the classification timestamp. History
keys hash the normalized address with its state. Only classification/evidence and
candidate summaries are stored, never credentials or full provider responses.
Candidate records retain first/last observation timestamps and stay unverified.

Local runs use `artifacts/history.json`; each successful lookup is atomically
saved before proceeding. If a later lookup fails, earlier work can be reused.
The workflow uploads history even after a sampling failure, with 90-day retention.
Candidate outputs remain separate 30-day review artifacts. Local `artifacts/`
is ignored by Git; no automatic listing publication or repository writes occur.

Artifact storage is not a permanent database: expiration, manual deletion, or
no retained artifact starts a new history. Retrieval errors or corrupt history
stop the run before API calls rather than silently discarding it. A canceled
runner may lose work that was not uploaded yet. This is a cost-saving cache,
not a guarantee against every duplicate request or an account-wide spend cap.

Run `node --test scripts/lib/discovery-history.test.mjs` to validate serialized
reuse, expiration, failure recovery, artifact selection, and actual CLI file
save/reload using a simulated provider. No paid requests are needed.
