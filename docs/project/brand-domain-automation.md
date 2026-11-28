# Permanent home, shared brand, and less manual work

Updated November 28, 2026. This is the next-work plan; the numbered backlog IDs
remain canonical in [backlog.md](backlog.md). No purchase, DNS change, paid plan,
newsletter launch, or scheduled publishing is authorized by writing this plan.

## Goal and boundaries

Log Cabin Scout is one brand across the website and @logcabinscout. It scouts
interesting real log homes across budgets, shares original property photography,
and links to the source listings. It is not limited to cheap houses or renovation
projects. Older cabins stay available with honest status labels.

The permanent website is live at **logcabinscout.com**. Keep purchase and renewal details in the [domain register](domain-register.csv).

Keep the existing compact website, pine/parchment/rust palette, serif/sans pairing,
selected Instagram icon A, four-photo post format, and simple Instagram links.
No “As seen on Instagram” promotional language, large hero/carousel, forced
subscription funnel, or dedicated mobile redesign in this phase.

## First — an inexpensive domain for one year (LCS-01–04)

| Subtask | Status | Completion / next action |
|---|---|---|
| 01a — Shortlist names | Research complete | Check brand fit and live availability of logcabinscout.com, scoutlogcabins.com, and a small number of readable alternatives. These are ideas, not confirmed available domains. Prefer .com; avoid awkward spelling or premium resale names. |
| 01b — Compare actual checkout totals | Published rates compared; cart pending | Compare two or three reputable registrars, including a low-cost option. Record first-year total, renewal price, transfer price, privacy, taxes/fees, and whether DNS/redirects cost extra. Skip unnecessary hosting/email/SSL bundles. |
| 01c — Set a one-year budget | Target recorded | Aim for roughly US$10–20 for year one and standard renewal around US$25 or less as a planning target, not a quoted offer. If a .com costs more, surface the tradeoff rather than chasing a misleading $1 promotion. |
| 01d — Select and register | Purchased per owner report | Owner chooses the exact domain and authorizes the checkout total; register one year in the owner's registrar account. Keep payment/account recovery private. Do not buy a name without authorization. |
| 01e — Record ownership and renewal | Backlog | Fill domain-register.csv with registrar, dates, renewal total, auto-renew decision, and reminder dates. Keep account IDs, passwords, and payment information out of Git. Set renewal reminders 60 and 30 days ahead; create actual reminders only when dates/service are known. |
| 02a — Keep free hosting | Done | Continue GitHub Pages initially. Connect the domain through DNS/CNAME and HTTPS; verify apex/www behavior and certificate before switching public links. A registrar change does not require moving the repository or buying hosting. |
| 03a — Verify site and integration URLs | Backlog | Inventory canonical URLs, sitemap, previews, Meta redirect/privacy/deletion URLs actually used, docs and workflow inputs. Update only verified dependencies; test login callbacks and production links. |
| 04a — Update Instagram profile | Backlog | Manually set the branded profile URL and concise bio, upload the saved icon if still needed, and verify the website/profile links. Existing captions keep original listing URLs. |

Deliverable: one owned, tracked branded domain; HTTPS website; working source and
profile links. Domain cost and hosting cost stay separate.

## Alongside domain selection — branding in usable pieces (LCS-06–07)

| Subtask | Status | Deliverable |
|---|---|---|
| 06a — One-sentence positioning | Ready | Write a short description of what we scout and why it is useful. Keep it specific to log homes and broad enough for affordable cabins and distinctive larger homes. No invented reach or success claims. |
| 06b — Editable logo master | Ready | Produce a clean editable master and document when to use icon A versus the wordmark. Review visual distinction from other cabin publishers; preserve the selected direction and rust-door detail. |
| 06c — Export kit | Backlog | Save profile PNG, favicon, horizontal website logo, social preview, and small-size proofs in one versioned brand folder. Record dimensions and filenames; keep generated concepts separate from final masters. |
| 06d — Color/type rules | Ready | Consolidate the existing palette, type scale, spacing, and contrast guidance into the existing brand guide. Avoid a new palette for every channel. |
| 06e — Website pass | Backlog | Apply the approved assets to compact header, favicon, footer and sharing preview; keep listings immediately visible. Website-wide logo replacement is a deliberate asset decision, not automatic copying of the IG avatar. |
| 06f — Instagram template lock | Ready | Keep four slides: cover with small lower white location/price, another exterior, land/detail, one interior. Caption stays title → facts → bare source URL → material notes → five hashtags → photo credit. Save reusable settings. |
| 06g — Profile copy kit | Backlog | Prepare consistent display name, short bio and website description, with the permanent domain only when live. Profile edits remain manual with the current API connection. |
| 06h — Brand acceptance check | Backlog | Compare website header, tiny profile icon, one carousel, and shared link preview together; verify readability, source credit, watermark visibility and no temporary-domain promotion. |

## Automation — start with preparation, then scheduling (LCS-08, 12–16, 20)

Already available: public discovery scripts, source review tools, post preparation,
deduplicated manual publishing, receipt history, website post links, and the new
on-demand status checker. Reuse these; do not build a second pipeline.

| Stage | Next work | Success measure / gate |
|---|---|---|
| A — One repeatable preparation run | Wrap discovery → candidate checks → photo selection proposals → template captions → ready queue → compact report. Add resume/checkpoint behavior. A proposed future command could be `scout:prepare`; it does not exist yet. | Re-running creates no duplicate properties or posts; exceptions are reported; no automatic posting. |
| B — Better source coverage | Add adapters gradually, keep free-first request budgets, verify identity and log construction, and cache successful lookups. | Record source coverage, confirmed candidates, failures and cost per run. Unsupported/blocked sources stay unconfirmed. |
| C — Photo and caption preparation | Rank distinct exterior/yard/interior candidates, preserve credits, reject obvious staged/duplicate shots, and preview covers. Generate text from verified fields, with explicit notes for off-grid/TLC/access issues. | Less per-post editing; unclear classification or photo selection is held for review rather than silently guessed. |
| D — A seven-post ready buffer | Track prepared/ready/scheduled/published/failed states with stable property IDs and a small calendar. Freshness-check facts immediately before each publish; do not use sold/pending homes as new for-sale features. | Seven distinct source-checked packages ready; missing data, quota or stale facts pauses the affected item. |
| E — Scheduled Instagram publication | Offer a conservative initial cadence, e.g. one post daily, with a user-selected timezone, start date, eligible queue and stop switch. Enable only when the owner explicitly selects the schedule. | Durable pre-publish claim, one publish request, account-history recovery, verified permalink/child count, rate/quota handling, no duplicate writes. |
| F — Status and photo maintenance | Reuse listings:status, retain old homes, update only confirmed states, and periodically check photo decoding. Schedule only after manual runs are stable and a supported runner/source is available. | Old homes retained; failed requests never mean sold; fact dates/prices not renewed by status-only checks. |
| G — Monitoring and useful summary | Surface queue depth, last successful run, token/permission health, stale candidates, failures and deployment drift. Generate a report first; add alerts through a chosen service later. | Failures are visible and recoverable without inspecting raw logs; no secrets in reports. |
| H — Operations dashboard only when useful | Begin with a generated local/read-only report. Add a hosted private dashboard and Supabase only when editing/shared state justifies their upkeep. | Show the same catalog/history, not a second source of truth. |
| I — Website release batches | Group data/brand/UI updates into coherent manual releases, with rollback. Consider release automation separately after the permanent domain is stable. | Posting to IG does not unexpectedly redeploy the website. |

Known constraint: Zillow has returned HTTP 403 from GitHub Actions runners. A
scheduled workflow is not sufficient by itself to promise fresh listing checks.
Use permitted source feeds/adapters or a supported execution environment; leave
preparation on demand until that dependency is solved. Do not work around access
blocks or rely on an always-running chat. Meta profile editing and following
accounts remain manual; they are separate from supported content publication.

Planning for maximum useful automation does not turn on unattended jobs now.
The goal is to automate repeatable steps and report exceptions, not to automate
unsupported account actions or publish uncertain listing facts.

## Reference review — Cheap Old Houses

Source reviewed: https://www.cheapoldhouses.com/ on November 28, 2026. Observations
below are from its homepage, not assumptions about its internal business or growth
causality. Its displayed prices/audience claims can change; we are not adopting them.

| Observed pattern | What is useful for Log Cabin Scout | What we will avoid |
|---|---|---|
| A clear editorial promise explaining what they hand-pick | One concise promise about distinctive real log homes, with source links and useful price/location facts | Reusing their wording, “cheap” positioning, or a universal low-price cap |
| Distinct recurring themes/newsletters (farmhouses, ultra-cheap, abroad) | Start with editorial themes such as affordable log cabins, wooded retreats, waterfront settings, and mountain homes | Adding many homepage sections, new filters, or paid tiers before evidence of demand |
| Social accounts are tied to their website and email list | Consistent profile identity, direct website/profile links, tagged profile traffic; consider a quiet optional weekly digest later | A heavy embedded feed, “As seen” badges, forced signup, or temporary-domain promotion |
| Saved-home/success-story navigation | Existing saved cabins plus occasional verified follow-up stories when genuinely available | Invented buyer stories, implied endorsements, or republishing properties without new context |
| An established publishing identity across properties and channels | Repeated cover/caption quality, a small ready buffer, a predictable posting cadence | Copying their logo, page design, books/TV/shop offering, or claiming their audience results as our own |

## Low-cost marketing experiments (LCS-17–19)

1. Alternate three editorial themes over a small batch; track saves, profile visits,
   website sessions and original-source clicks. Do not assume more hashtags cause
   growth or set invented performance baselines.
2. Use consistent source-linked posts and a permanent-domain profile link to make
   the brand easy to recognize. Keep IG URLs in captions as original listing URLs.
3. Add a quiet opt-in digest only after choosing a low-cost provider and verifying
   a real need. Start with one general digest; segmentation/payment is later work.
4. Keep the existing Virginia architecture/interiors/builder shortlist. Following
   is manual; collaboration outreach needs explicit authorization and a concrete
   message. Focus on relevant conversations rather than bulk engagement.
5. Consider reader-submitted cabins later, with a simple review queue and source
   verification; never publish submissions automatically on receipt.

## Next sequence

**Now:** domain shortlist/checkout comparison and a small positioning/asset audit.
**Then:** one-year domain purchase after owner selection → DNS/HTTPS migration →
profile/site identity update → one integrated preparation command → seven-post
ready buffer → monitoring → explicitly chosen posting schedule.

Keep domain migration, brand decisions, preparation automation, and scheduled
publication as separately tracked deliveries. Continue existing manual posting
while those pieces mature. The detailed backlog remains the record of status.

## Domain research result

[November 28 shortlist and pricing](domain-shortlist-2026-11-28.md) recommends
logcabinscout.com at Porkbun, subject to owner selection and a standard one-year
checkout. No registry record was returned; registrar availability and cart total
remain unconfirmed. Nothing has been purchased.

## Purchase update

Owner reports the new selected domain purchased at GoDaddy. Follow the
[GoDaddy launch checklist](godaddy-domain-launch.md); capture the receipt and
renewal details, then migrate DNS and HTTPS. Earlier registrar recommendations
and unpurchased notes are historical; live website configuration is unchanged.
