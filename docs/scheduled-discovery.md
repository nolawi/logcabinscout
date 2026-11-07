# Scheduled RentCast discovery

The GitHub Actions workflow `.github/workflows/rentcast-discover.yml`
runs every **Monday at 12:17 UTC** and can also be triggered manually.

## Cost controls

- Each run issues at most **4 successful RentCast requests** (one sale search,
  up to three property-record lookups).
- A Monday-only schedule gives **4–5 runs per calendar month**, or
  approximately **16–20 successful requests/month** if all lookups are made.
- This is deliberately below the advertised free Developer allowance
  (50 requests/month) but is NOT a strict account-wide quota guarantee.
  Manual executions, other apps/scripts, re-runs, and billable usage
  elsewhere can still exceed it. RentCast does not enforce hard spend caps.
- No key configured? The job skips the API call and reports a notice.
- The workflow does not publish candidate properties or update the site.

## Geographic sampling

For scheduled runs, the workflow rotates through Virginia, West Virginia,
North Carolina, Tennessee, Pennsylvania, New York, Colorado, Montana, Idaho,
and Washington. Manual runs can choose one of these states.

**Caution:** Sampling the first three results in a state is unlikely to find
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
