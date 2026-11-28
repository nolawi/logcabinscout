# Keep older cabins; check their status on demand

Decision recorded November 28, 2026. This is a backlog specification, not an
implemented status checker. The owner wants older listings retained and less
routine manual maintenance.

## Product direction

- Keep the property record, original source, photos, and Instagram associations
  as it ages. Do not remove a home merely because its review date is old.
- Age alone does not mean sold or inactive. Do not renew a check date just to keep
  a card visible. No six-month cutoff is planned for this approach.
- Label **Sold** only after explicit property-level source evidence. Label
  **Pending** and **Off market** separately when the source explicitly supports
  them. A blocked request, missing page, expired URL, timeout, or ambiguous status
  means **Status unconfirmed**, never sold.
- Keep sold homes accessible as part of the collection, visibly labeled, while
  distinguishing them from homes presented as currently for sale. Keep the
  original listing action and show prices as last-known prices, not sale prices.
- Existing Instagram posts are historical snapshots. A later website status
  change should not delete, republish, or automatically edit those posts.

## Future command: “Check listing statuses” (LCS-13)

Build one reusable command so the owner can ask Codex to run a status check on
all due listings, a state, or a chosen property. It is manual-triggered automation,
not a new scheduled service. An automated schedule can be considered later.

1. Choose due records by status-check age; skip recent checks, deduplicate source
   URLs, and process in small batches with bounded requests and concurrency.
2. Fetch the original listing and match the property's stable identity. Prefer
   explicit brokerage/MLS status where accessible; use the original provider's
   structured status when that is the available source. Flag conflicting sources.
3. Produce an auditable change report: confirmed changes, unchanged records,
   failed/unknown checks, and the evidence used. Include a preview mode.
4. Apply confirmed changes in one controlled run, preserving prior values and
   failed attempts. Do not apply ambiguous status or price changes. The owner can
   request the check-and-apply run together without approving each property.
5. Return a compact summary. Retrying failures is selective and bounded; no
   paid API calls by default. Website deployment stays a separate release action.

Minimum data additions: `saleStatus` (active/pending/sold/off_market/unknown),
`statusCheckedAt`, `statusSourceUrl`, `statusEvidence`, optional `soldAt` only
when supplied by the source, and a change log. Keep property IDs stable.
A successful identity/status check can update its own check timestamp; retain a
separate timestamp for verified price/home facts so a status-only check never
pretends all listing facts have been revalidated. Failed checks record an attempt
without erasing the previous confirmed state; the UI can show that confirmation
is old or unavailable.

## Implementation order and acceptance

1. **Next: photo-health audit.** Find genuinely broken or unavailable photos and
   fix only affected image references where source identity can be verified.
   Do not prune old listings or refresh listing dates as part of that audit.
2. Implement LCS-13 with fixtures covering explicit sold, pending, off-market,
   unchanged, blocked, missing, conflicting, and malformed source responses.
   Repeated application must not duplicate changes or overwrite good evidence.
3. Replace the current browser's 30-day visibility expiry with retention and
   honest status labeling in the same release as the status model. Keep unknown
   and historical homes distinct from confirmed available homes in UI and SEO;
   update “for sale” counts/structured data accordingly.
4. Trial a small mixed batch, inspect the change report, then expand coverage.
   Preserve a rollback/export path and the existing Instagram ledger.

The current application still uses the 30-day rule until that implementation
ships. No listing data, visibility behavior, or statuses were changed by this
planning update.
