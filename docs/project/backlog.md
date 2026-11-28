# Log Cabin Scout — project plan and backlog

Updated: November 28, 2026. Owner: project owner. Delivery: Codex with the owner.

## Purpose

Run Log Cabin Scout as one property-discovery brand: a permanent branded domain,
a useful website, and an Instagram account connected through one listing catalog,
shared visuals, and a manageable publishing workflow. Grow reach while keeping
operating costs low and listing facts traceable to their original sources.

This document is the canonical project backlog. The user authorized this plan;
items below describe future work, not completed implementations or authorization
to buy domains, incur recurring charges, or turn on unattended publishing.

## Current baseline

- Website: https://elancabin.com/ on GitHub Pages; temporary brand/domain relationship.
- Repository: https://github.com/nolawi/logcabinscout
- Instagram: https://www.instagram.com/logcabinscout/
- Repository inventory: 49 reviewed listings and 40 published-property records.
  These are inventory counts, not a claim that all properties remain active or
  visible today. The website currently expires listings 30 days after checking.
- Search/filter/sort, saved cabins, prerendered SEO, manual deployments, and
  Instagram publication history already exist. A header link to Instagram exists.
- Instagram posts: four slides, mostly exterior photos and one interior; location
  and price on the cover; caption order is title, facts, bare listing URL, material
  notes, five hashtags, photo credit. Existing posts keep their historical copy.
- Profile icon A is saved in `public/brand/instagram-profile-a.png`; manual upload
  is required. Website artwork still uses the original emblem. A similar cabin /
  green-background motif was found on @loghomeliving; assess distinction in item 6.
- Supabase schema exists but is not connected to the app. No admin dashboard yet.
- Manual post batches check sources and prevent repeats. A weekly draft workflow
  exists; unattended publishing is not enabled. Meta cannot follow accounts or
  change the profile photo through the current connection.

## Tracking rules

Statuses: Ready, Backlog, In progress, Blocked, Done. All items start unimplemented.
Priority P0 = launch foundation, P1 = operating workflow, P2 = growth/optional.
Work on one main item at a time. Record evidence before setting Done. Keep IDs
stable across this file, GitHub issues, and Notion. No arbitrary delivery dates.

### Early — connect the brand (1–7)

| ID | Priority | Status | Task | Done when | Depends on |
|---|---|---|---|---|---|
| LCS-01 | P0 | Ready | Choose a permanent Log Cabin Scout domain | Check availability and naming fit; record the selected domain, registrar, renewal cost, and ownership. Purchase only after the owner chooses and authorizes the cost. | — |
| LCS-02 | P0 | Backlog | Move the website to that domain | Configure DNS, CNAME, HTTPS, and apex/www behavior; verify the production site; retain a rollback plan. Use registrar redirects for the old domain if supported. | 01 |
| LCS-03 | P0 | Backlog | Complete the domain migration for SEO and integrations | Update canonical URLs, sitemap, social previews, repository settings, and any Meta OAuth/privacy URLs actually in use; verify old links and search-console setup. | 02 |
| LCS-04 | P0 | Backlog | Connect the Instagram profile to the website | Set the permanent website in the profile link and a clear bio; upload the selected profile icon manually. Verify the link opens the correct site. | 02, 06 |
| LCS-05 | P0 | Ready | Make website and Instagram navigation feel connected | Audit the existing header link; add useful Instagram links to footer/about or listing context, and define a simple Instagram landing route. Avoid a heavy embedded feed. Verify each route. | — |
| LCS-06 | P0 | Ready | Unify the visual brand | Save editable masters, icon exports, colors, typography, and usage rules; compare the selected icon with similar publishers and refine distinguishing features. Match profile, website, covers, and social previews without cluttering property photos. | — |
| LCS-07 | P1 | Ready | Simplify the website around finding cabins | Review desktop header, cards, photo hierarchy, filters, and original-listing actions; make listings immediately accessible. No new hero, long introductory copy, or dedicated mobile redesign in this phase. | — |

### Next — manage one operation (8–15)

| ID | Priority | Status | Task | Done when | Depends on |
|---|---|---|---|---|---|
| LCS-08 | P1 | Ready | Define one shared listing and content model | Document stable property IDs, source facts, review dates, photo provenance, captions, slide selections, queue states, and published Instagram IDs/links. Decide which fields remain file-backed initially. | — |
| LCS-09 | P1 | Done | Link published Instagram posts to website listings | Join publication history to property IDs; show verified post links on relevant cards/detail views Keep this to simple secondary links; no Instagram-only filter or promotional badges. No guessed links or browser-only API secrets. | 05, 08 |
| LCS-10 | P1 | Backlog | Build a private operations dashboard | Secure the operator view; show candidates, stale listings, ready posts, published posts, failures, and last successful jobs. Start read-only; add actions only as needed. | 08 |
| LCS-11 | P1 | Backlog | Connect Supabase when the dashboard needs it | Review the existing schema, migrate a small sample, apply access rules, keep tokens server-side, and preserve stable IDs/history. Document rollback/export. Stay file-backed until persistence needs justify migration. | 08, 10 |
| LCS-12 | P1 | Ready | Expand reliable nationwide discovery | Improve free-first state rotation, source coverage, log-home evidence, and deduplication. Review a small new batch across several states; measure candidate quality and requests. Do not introduce paid API usage by default. | — |
| LCS-13 | P1 | Ready | Keep older cabins and automate on-demand status checks | Retain aging records; build a reusable check-and-apply command with evidence and change history. Label confirmed sold/pending/off-market states; preserve uncertain checks. Replace age-only expiry with honest status labels and correct for-sale counts/SEO when implemented. See listing-lifecycle.md. | 08 |
| LCS-14 | P1 | Backlog | Streamline photo selection and post preparation | Offer a gallery picker with four distinct images, mostly exterior and one interior; keep source credits/watermarks, material notes, small cover text, and the agreed caption format. Preview quickly before publishing. | 08, 10 |
| LCS-15 | P1 | Backlog | Add monitoring and a publishing recovery runbook | Surface token expiry, source failures, queue failures, duplicate protection, publishing receipts, and deployment status. Exercise failure/reconciliation paths and retain recoverable backups. | 10 |

### Consider / Later — automate and grow (16–20)

| ID | Priority | Status | Task | Done when | Depends on |
|---|---|---|---|---|---|
| LCS-16 | P2 | Backlog | Introduce controlled scheduling | Start with a visible content calendar and prepared queue. Define cadence, fresh source checks, rate limits, idempotency, stop conditions, and a kill switch. Enable unattended publication only after the owner explicitly chooses it. | 14, 15 |
| LCS-17 | P2 | Backlog | Measure useful growth | Choose low-cost analytics; track Instagram-to-site visits, original-listing clicks, saves, and state interest. Use tagged profile links; establish a baseline before claiming improvements. | 02, 04 |
| LCS-18 | P2 | Backlog | Expand useful SEO content | Add state/location pages only where inventory supports them, strengthen listing metadata/internal links, and verify search indexing on the permanent domain. Avoid thin mass-generated pages. | 03, 12, 13 |
| LCS-19 | P2 | Backlog | Create a practical marketing program | Define a short editorial calendar mixing affordable cabins, distinctive exteriors, and regional finds. Keep a shortlist of Virginia architects/builders/designers, draft collaboration ideas, and test themes against measured results. Following and outreach remain manual unless specifically authorized and supported. | 06, 17 |
| LCS-20 | P2 | Ready | Run a weekly project and backlog review | Review inventory, published content, failures, spend, and results; select the next item; update statuses and evidence; maintain this repository backlog. Consider alerts, email digests, or advanced filters only after core usage supports them. | — |

## Recommended starting order

Start 01 (domain decision) and 06 (brand assets). While domain selection is pending,
complete 05 (social navigation audit) and design 08 (shared data model). Then deliver
02–04 as one domain launch, followed by 09–10 as one website/Instagram operations
milestone. Improve discovery and freshness in small batches throughout. Add
scheduling and marketing measurement after the workflow is reliable.

## Master Notion project

Suggested parent: the owner's existing master project list, not a new unrelated
workspace. Project name: **Log Cabin Scout — Website + Instagram**.

Properties: Project, Task ID, Name, Phase, Priority, Status, Owner, Depends on,
Completion criteria, Evidence/PR, Next action, Last updated.

Views: Early / Next / Consider, Board by status, Blocked, Done. Keep the project
summary linked to this canonical GitHub backlog. `backlog-notion-import.csv`
contains the same 20 IDs for initial import; use IDs to update existing tasks
instead of importing duplicates. Refresh the export when statuses change.

Notion sync status: deferred at the owner’s request. The repository backlog is
sufficient for tracking; Notion is not a dependency for any current work. The CSV
remains available as an optional export. No Notion pages or tasks were created.

## Activity log

- 2026-11-28: Created the 20-item backlog and initial Notion import; recorded the
  existing website/Instagram baseline. No domain purchase, website deployment,
  dashboard implementation, or new automatic publishing was performed.


## Access check and quick wins — November 28, 2026

Verified: local checkout/files, repository read/push permissions, Actions workflow
listing and dispatch, live website HTTPS, Pages custom-domain configuration,
public listing-source HTTP access, and the existing Meta token's account read
access (Check Meta connection run 46113481163). No post or deployment was sent.
Publishing worked in prior batches; this check did not create media or test a new
publish. The current header already links to @logcabinscout.

Unavailable or unverified: registrar/DNS controls, direct Supabase connection,
Instagram profile-photo/bio editing, and analytics/search-console accounts.
The GitHub integration returns 403 when listing repository Actions secrets; it
can run workflows that use existing secrets, but secret management is not
verified. No credential values were requested or printed.

Recommended small deliveries, in order:

1. **LCS-09 + minimum LCS-08:** join committed publication history to listings by
   existing IDs and add “View on Instagram” links only where verified permalinks
   exist. Use the current JSON files; no database migration needed.
2. **LCS-05 / LCS-09:** add an “As seen on Instagram” collection view and a useful
   footer Instagram link; build on the existing header link.
3. **LCS-06 / LCS-07:** make a compact shared-brand pass on website colors,
   typography, and social previews. Reuse existing assets; keep a website logo
   replacement as an explicit design choice.
4. **LCS-13 / LCS-12:** retain older records and build on-demand status checking,
   rather than recurring manual cleanup. Start with photo reliability; source-check
   new candidates separately. See the lifecycle strategy below.
5. **LCS-10:** generate a small local read-only operations page/report showing
   current, stale, queued, published, and failed items. Defer hosted dashboard,
   authentication changes, and Supabase until needed.

The domain shortlist (LCS-01) can be researched alongside these; buying and DNS
changes need the owner's selected domain and registrar access. No paid services,
automatic publishing, website deployment, or implementation of these five items
was performed in this access/planning pass.


### Website–Instagram links delivered — November 28, 2026

LCS-09 is implemented and locally verified, pending the next manual website
release. Cards show confirmed Instagram permalinks and an “As seen on Instagram”
filter combines with existing search/state/price/sort/saved controls. The minimal
LCS-08 mapping uses exact listing IDs and validated published ledger URLs; no
schema migration was needed. LCS-08 remains open for the broader content model.
LCS-05 remains open for the footer/landing-route follow-up.

Evidence: `docs/website-instagram.md`, `src/lib/instagram.ts` and its tests;
104 tests passing, production build/SEO checks passing, desktop interactions
verified with 49 current cards and 37 linked properties. No guessed links for
three legacy records without permalinks. No website deployment performed.


### Direction refinement — November 28, 2026

The owner requested simple Instagram links only. Removed the Instagram-only
filter; keep card links and the existing header link. This supersedes earlier
“As seen on Instagram” plans and delivery notes. Do not expand the social
integration into promotional badges or dedicated filtering.

Next recommended task: a photo-health audit and targeted fixes only. Retain older
listings; do not make routine age-based cleanup the operating workflow. Follow
with the on-demand status checker (LCS-13) and source-checked additions (LCS-12).
No dashboard or database migration is needed for the photo audit.


### Older-listing strategy — November 28, 2026

The owner prefers keeping older properties and using reusable automation when
asked to check status. [Listing lifecycle specification](listing-lifecycle.md)
records the decision, status/evidence rules, future command behavior, and the
migration away from the current 30-day visibility rule. A missing/blocked source
is never evidence of a sale. Sold records stay accessible and clearly labeled;
Instagram history remains intact. No status checker or listing changes shipped
in this planning update.

**Next:** audit photo reliability and fix affected image references, with no
age-based pruning. **After that:** implement LCS-13's on-demand status command
and retained-listing/status presentation together. Notion stays deferred.


### Photo reliability audit complete — November 28, 2026

All 49 current feed photo URLs returned HTTP 200 and decoded as valid images.
A desktop browser scrolled the full grid and decoded all 49 photos: zero photo
fallbacks and zero page errors. The production build and SEO checks passed.
[Audit evidence](photo-audit-2026-11-28.json) records URLs, dimensions, and results.

Earlier automated previews showed unavailable photos because the cloud browser
reported `ERR_CERT_AUTHORITY_INVALID` for the external image CDN. The audit's
browser context accommodated the environment certificate; independent curl
requests validated the same URLs with normal certificate verification. No TLS
setting, image URL, review date, property status, or listing record was changed.
No website deployment was performed. An image loading does not confirm a home's
current sale status.

**Next:** implement LCS-13's reusable on-demand status check and retained-listing
presentation from `listing-lifecycle.md`. Preserve old homes and Instagram links;
label explicit source-confirmed changes and keep failures unconfirmed. The
photo-cleanup step is complete; do not replace working URLs unnecessarily.
