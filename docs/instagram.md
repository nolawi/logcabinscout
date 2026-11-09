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

### Check a Unified Login connection

Newer Meta apps may require Unified Login and a business portfolio instead of
the older Instagram Login dashboard flow. Save the resulting token directly as
the repository Actions secret `INSTAGRAM_ACCESS_TOKEN`; never paste it in chat.
Run **Check Meta connection** manually from Actions on main. It makes read-only
requests to the Facebook Graph API for the authenticated identity and granted
`instagram_basic` / `instagram_content_publish` permissions. It logs no token
or raw provider responses. Missing secrets and rejected tokens fail the job.
A passing check verifies authentication and permissions only; it does not verify
the target Instagram asset, create media containers, or publish anything.
Publishing remains disconnected until target account access and a separate
publishing integration are implemented and tested.

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
