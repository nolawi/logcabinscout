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
| LCS-09 | P1 | Backlog | Link published Instagram posts to website listings | Join publication history to property IDs; show verified post links on relevant cards/detail views and offer an “As seen on Instagram” view. No guessed links or browser-only API secrets. | 05, 08 |
| LCS-10 | P1 | Backlog | Build a private operations dashboard | Secure the operator view; show candidates, stale listings, ready posts, published posts, failures, and last successful jobs. Start read-only; add actions only as needed. | 08 |
| LCS-11 | P1 | Backlog | Connect Supabase when the dashboard needs it | Review the existing schema, migrate a small sample, apply access rules, keep tokens server-side, and preserve stable IDs/history. Document rollback/export. Stay file-backed until persistence needs justify migration. | 08, 10 |
| LCS-12 | P1 | Ready | Expand reliable nationwide discovery | Improve free-first state rotation, source coverage, log-home evidence, and deduplication. Review a small new batch across several states; measure candidate quality and requests. Do not introduce paid API usage by default. | — |
| LCS-13 | P1 | Ready | Maintain listing freshness and accurate facts | Track last successful checks, changed prices/photos, and unavailable sources; never refresh dates without checking. Decide separately whether to adopt the discussed six-month listing-date window. Avoid automatically removing inactive homes until that policy is chosen. | 08 |
| LCS-14 | P1 | Backlog | Streamline photo selection and post preparation | Offer a gallery picker with four distinct images, mostly exterior and one interior; keep source credits/watermarks, material notes, small cover text, and the agreed caption format. Preview quickly before publishing. | 08, 10 |
| LCS-15 | P1 | Backlog | Add monitoring and a publishing recovery runbook | Surface token expiry, source failures, queue failures, duplicate protection, publishing receipts, and deployment status. Exercise failure/reconciliation paths and retain recoverable backups. | 10 |

### Consider / Later — automate and grow (16–20)

| ID | Priority | Status | Task | Done when | Depends on |
|---|---|---|---|---|---|
| LCS-16 | P2 | Backlog | Introduce controlled scheduling | Start with a visible content calendar and prepared queue. Define cadence, fresh source checks, rate limits, idempotency, stop conditions, and a kill switch. Enable unattended publication only after the owner explicitly chooses it. | 14, 15 |
| LCS-17 | P2 | Backlog | Measure useful growth | Choose low-cost analytics; track Instagram-to-site visits, original-listing clicks, saves, and state interest. Use tagged profile links; establish a baseline before claiming improvements. | 02, 04 |
| LCS-18 | P2 | Backlog | Expand useful SEO content | Add state/location pages only where inventory supports them, strengthen listing metadata/internal links, and verify search indexing on the permanent domain. Avoid thin mass-generated pages. | 03, 12, 13 |
| LCS-19 | P2 | Backlog | Create a practical marketing program | Define a short editorial calendar mixing affordable cabins, distinctive exteriors, and regional finds. Keep a shortlist of Virginia architects/builders/designers, draft collaboration ideas, and test themes against measured results. Following and outreach remain manual unless specifically authorized and supported. | 06, 17 |
| LCS-20 | P2 | Ready | Run a weekly project and backlog review | Review inventory, published content, failures, spend, and results; select the next item; update statuses and evidence; synchronize the master Notion project. Consider alerts, email digests, or advanced filters only after core usage supports them. | — |

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

Notion sync status: pending connection. No master-list destination has been
verified and no Notion page or tasks have been created in this session.

## Activity log

- 2026-11-28: Created the 20-item backlog and initial Notion import; recorded the
  existing website/Instagram baseline. No domain purchase, website deployment,
  dashboard implementation, or new automatic publishing was performed.
