# Log Cabin Scout — new-chat handoff

Updated November 28, 2026. Read this first, then the linked backlog and launch
checklist. This records project decisions and evidence, not credentials. The new
chat must inspect actual tool availability, current Git state and live DNS before
acting; a new chat does not automatically inherit private browser sessions.

## What the owner wants

Build one recognizable **Log Cabin Scout** brand: a useful nationwide log-home
website on its own domain and @logcabinscout on Instagram, connected through the
same reviewed catalog and published-post history. Keep the browsing experience
simple and the operating cost low. Automate repeatable discovery, photo/caption
preparation, status checks, queueing, publishing verification and monitoring as
much as practical. Handle uncertain cases explicitly instead of guessing.

elancabin.com was only temporary hosting. The owner has reported buying
**logcabinscout.com at GoDaddy** and wants to connect it to the existing website.
Do not research/buy another domain or repeat the domain-purchase step.
The exact receipt amount, term, renewal date/rate and auto-renew decision remain
unverified; record them later without inventing them.

## Immediate task: finish DNS, then migrate the website

The owner was editing GoDaddy DNS and asked for step-by-step assistance. They are
moving chats because this chat receives the right-hand browser tab URL but has no
browser-control tools. The environment reports desktop support and its runtime
is installed, but the browser controls are absent from the active tool list.
There was no GoDaddy login failure. Do not keep asking them to sign in to solve
missing chat capabilities. A fresh chat may expose browser tools but this is not
guaranteed. Verify before promising to click or read the page.

At the last public DNS check on November 28:

- Nameservers: ns37.domaincontrol.com and ns38.domaincontrol.com. Leave them alone.
- Correct apex A records: 185.199.108.153, 185.199.109.153, 185.199.110.153.
- Incorrect remaining apex A: **185.230.63.107** (Wix); edit it to **185.199.111.153**.
- Existing www CNAME: **pointing.wixdns.net**; edit its target to **nolawi.github.io**.
- GoDaddy previously displayed “Template Applied: Wix”. Check whether it controls
  edits if needed, but do not remove unrelated DNS or email records blindly.
- The user got “www conflicts with another record” by adding a second www entry.
  Edit the existing row, not Add New Record. Other domains' www records are separate.
- Leave NS, SOA, _domainconnect, MX and unrelated TXT/_dmarc records alone.

**Recheck public DNS first**: these observations may already have changed.
GoDaddy page the user was on:
https://dcc.godaddy.com/control/portfolio/logcabinscout.com/settings?tab=dns

Then follow [the launch checklist](godaddy-domain-launch.md). Once new-domain DNS
is correct, prepare and test matching CNAME/canonical/preview/sitemap configuration,
change this repository's Pages custom domain, deploy, and verify HTTPS/assets,
listing/source/Instagram links and search. Check existing Meta redirect/privacy
URLs before changing anything they actually depend on. A static site root is
not automatically an OAuth callback handler.

Current active GitHub Pages custom domain is still **elancabin.com**, HTTPS on.
Last checked successful website deployment: run **44150005236**, source commit
**386aab6f6ef1b6d2ea041870e103f70de3a8d8c9**. Main is significantly newer. Deploying
main will release all accumulated website changes; inspect and communicate that.
Do not claim the new website is live merely because main was pushed.

Keep the old domain registered and plan its redirect separately. GitHub Pages
has one assigned custom domain; it cannot guarantee both domains continue serving
the same site after reassignment. Document/test redirect or rollback behavior.

## Repo, tools and operating rules

- Repo: https://github.com/nolawi/logcabinscout, branch main.
- Cloud checkout has been /workspace/logcabinscout; inspect before assuming.
- Stack: React, TypeScript, Vite, SCSS, JSON feeds, GitHub Actions; Supabase schema
  exists but is not connected. A database is not required for the next tasks.
- Inspect changes first. Use a feature branch, meaningful tests and build, then
  merge/push main. The owner has explicitly authorized merging to main without
  asking each time. Never commit secrets or overwrite unrelated edits.
- Website deployment is manual. Main pushes run build CI only. Domain migration
  is the current intended release; unrelated future steps should not auto-deploy.
- gh CLI can read/write this repo and dispatch workflows. Listing repository
  Actions secrets returned 403 even though workflow dispatch works. Existing Meta
  secrets work inside Actions; do not expose them or assume secret-setting access.
- No registrar/DNS API connection has been established. Browser sign-in alone
  does not establish agent control. Current GoDaddy changes have been owner-made.
- No Notion dependency. The canonical backlog lives in Git. Stop spending time
  on the unavailable Notion plugin; an optional import CSV is already saved.
- User prefers direct progress, minimal approvals and concise summaries. They
  dislike repeated screenshots/confirmation requests. Domain billing and any
  new recurring spend still need an actual selected price/authorization.
- No paid RentCast calls or new paid services by default. No unattended posting
  schedule is active. Plan automation, but enable a real schedule only when the
  owner picks cadence/timezone/start/eligible queue and stop conditions.
- Dedicated mobile redesign is out of scope for now.

## Completed on main (awaiting website release)

- 49 reviewed property records; 40 published-property records, 37 with confirmed
  permalinks. Counts are repository inventory, not proof every home is for sale.
- Card “View on Instagram” links match exact property IDs to confirmed URLs.
  The owner rejected “As seen on Instagram” marketing and the extra IG filter;
  it was removed. Keep simple secondary links and the existing header IG link.
- Photo audit: all 49 source photos decoded and loaded; no URL changes needed.
  Earlier headless previews failed on the cloud proxy certificate, not broken
  photos. Independent curl checks used normal certificate verification. The
  audit browser tolerated the environment certificate only for its test context;
  production TLS behavior was never weakened.
- Older homes now stay visible, including pending/sold/off-market records.
  The previous 30-day visibility cutoff was removed. Thirty days now controls
  status/price freshness labels, not deletion. Failed source checks never mean sold.
- On-demand status checker has preview/apply, limits, due intervals, identity
  checks, evidence/attempt/change history, rollback, and a shared review lock.
  Zillow supported; other adapters safely return unconfirmed.
- A three-home trial confirmed Harpers Ferry pending; Greenbush and Floyd active.
  Price/fact-review timestamps/photos and Instagram history were preserved.
  No all-property status run has been performed. Do not imply all 49 were refreshed.
- Status-only checks never renew price/fact dates. Historical prices are labeled
  “Last listed price”. Metadata/schema distinguish retained and for-sale homes.
- Latest implementation validation: **115 tests passed**, production/SEO build
  passed, desktop real and synthetic retained-status scenarios passed.
- Saved logo option A: public/brand/instagram-profile-a.png. It is a generated PNG,
  not yet an editable master. Instagram upload is manual. Website uses the old
  emblem until an explicit brand pass. Similarity to @loghomeliving's white cabin
  on green was disclosed; owner still chose A. Keep rust door/heavy log styling.

## Brand and Instagram preferences

Vintage American field guide with modern property discovery: pine green, warm
parchment, rust, goldenrod; Playfair Display and DM Sans. Compact single-line
header, no big hero/carousel/story block, minimal copy, get to the cabins quickly.
Original source links stay prominent. Do not add temporary-domain promotion to IG.

Every new property carousel uses:
1. Strong exterior with white location and price, horizontally centered lower down.
2. Different exterior.
3. Land/yard/exterior detail.
4. Exactly one interior, prefer an unstaged image.

Cover text at 1280px: location 42px, price 80px, center of text block at 78% height;
subtle shadow, no border/logo/website. Preserve photo source watermarks.

Caption order: short unique factual title; blank line; address/location,
price/acreage and known beds/baths/area; blank line; bare original listing URL;
material notes (TLC/off-grid/access/uncertain figures); five relevant hashtags;
photo credit last. No “Full listing:” label, “link in bio”, elancabin promotion,
or boilerplate availability disclaimer. Owner reports MLS licenses; retain source
credits/provenance and do not interrogate permission on every batch.

Meta current connection can publish, read quota and history. Following accounts,
profile-photo/bio changes and deleting prior tests remain manual with this setup.
Never retry an ambiguous media_publish request. Verify history and reconcile the
ledger first; the publisher has a bounded read-only confirmation path.

## Useful commands

```sh
npm test
npm run build
npm run review -- --help
npm run listings:status                         # preview due records
npm run listings:status -- --apply --limit 10    # apply confirmed due checks
npm run listings:status -- --id zillow:22573204  # preview an exact property
npm run instagram:post -- --list
CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run instagram:prepare -- QUEUE_ID
npm run instagram:post -- QUEUE_ID              # up to 3 per batch
npm run deploy                                 # manual website deployment
```

Do not republish existing properties; inspect data/instagram-post-history.json.
Build may create an untracked tsconfig.tsbuildinfo; remove only if generated by
your task. node_modules, dist, artifacts and .env are ignored. Node 22+ required;
local Node 24, Python Playwright, Chromium and Pillow have been available.

Zillow has returned 403 to GitHub Actions. The publishing client checks live source
facts before dispatching with a short-lived checksum/time attestation. A schedule
needs a supported source/runner; do not bypass source access blocks or promise an
always-running chat. Images/covers must be publicly reachable before Meta fetches
them. New compiled website post links become live after a manual site deployment.

## Long-term backlog and next order

- [20-item canonical backlog](backlog.md) — stable LCS IDs; 09 and 13 implemented.
- [Domain/brand/automation breakdown](brand-domain-automation.md) — detailed subtasks.
- [Domain register](domain-register.csv) — owner-reported purchase; costs/renewal pending.
- [DNS/domain launch checklist](godaddy-domain-launch.md) — current immediate task.
- [Status checker guide](../listing-status.md) and [lifecycle rules](listing-lifecycle.md).
- [Instagram workflow](../instagram.md), [website link mapping](../website-instagram.md).

After domain launch: brand kit/editable logo and consistent profile/site assets;
repeatable discovery/verification/photo/caption preparation; seven-post ready
buffer; operational report/monitoring; explicitly chosen posting schedule;
then useful analytics/SEO/editorial experiments. Dashboard starts read-only;
Supabase only when persistence needs justify it. Cheap Old Houses is inspiration
for clear curation/themes/cross-channel continuity, not a design, “cheap” niche,
subscription-heavy homepage, or growth claims to copy.

No new Instagram posts, paid services, domain purchase, deployment, or DNS edits
were performed merely to create this handoff.
