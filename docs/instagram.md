# Instagram drafts: free-first setup

The `Prepare Instagram drafts` workflow produces a weekly batch of two draft
posts from the currently published collection at `https://elancabin.com/listings.json`.
Queued, undeployed listings on main are not promoted. A failed feed request stops
the run instead of falling back to unpublished content. It also supports manual runs on main.
It uploads original 1080×1350 PNG cards, captions, alt text, HTML sources, and a
manifest as a 30-day GitHub Actions artifact named `instagram-drafts`.

The cards use our own logo and landscape artwork with listing facts. Brokerage
and Zillow photographs are not reused in social cards. Different states are
preferred, and selection rotates weekly. Only current feed records are eligible;
if no records are current, the manifest records an empty batch instead of posting
stale or fictional listings. A one-property feed creates one draft, not duplicates.

Generate locally:

```bash
npm run instagram:drafts
# Use the installed Playwright Chromium, or set CHROMIUM_EXECUTABLE to a local binary.
python scripts/render-social-drafts.py
```

The renderer uses Python Playwright 1.62.0 (pinned in CI). Its browser renders only
local inline HTML/SVG; external requests during rendering are blocked.
The generator makes one public HTTPS feed request, with no provider API calls. Draft outputs are under
ignored `artifacts/instagram/`. No Instagram password, Meta token, paid API,
third-party scheduling subscription, or website deployment is needed.

## Publishing is not connected

This workflow does not contact Instagram, create media containers, publish posts,
or send messages. A manifest always marks `published: false`. It is not a posting
history or a guarantee against reposting the same property after inventory changes.
Inspect captions and current source details before choosing a draft to publish.

For direct publishing later, connect the professional Instagram account through
Meta's official authorization flow and configure the required app permissions and
secure token storage. That external account connection has not been performed in
this repository or chat. Never paste passwords or tokens into chat or commit them.
Property-photo posts would additionally need social-use permission from the
relevant rights holder. The current original-artwork cards avoid that dependency.

The website's deployment stays manual and is unrelated to this draft schedule.
