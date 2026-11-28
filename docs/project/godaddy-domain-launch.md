# Connect logcabinscout.com from GoDaddy to GitHub Pages

November 28, 2026: owner reports purchasing the selected new domain at GoDaddy.
Target is logcabinscout.com, based on the selected checkout target; the receipt,
registration term, exact cost, renewal date/rate and auto-renew setting have not
been inspected. Record these from GoDaddy when available; do not infer them from
the earlier one-year research or Porkbun prices.

The production site runs at https://logcabinscout.com/ on GitHub Pages. The
[launch deployment](https://github.com/nolawi/logcabinscout/actions/runs/46149875312)
verified HTTPS and the www redirect. The DNS instructions below document the
configured records for future checks.

## 1. Owner: change the new domain's DNS at GoDaddy

Open https://dcc.godaddy.com/control/portfolio then logcabinscout.com → DNS /
Manage DNS. Keep the current nameservers. Change only the conflicting apex A
records and www CNAME; leave email/MX and unrelated TXT records in place.

Replace the existing apex A targets with these four records:

| Type | Name | Value | TTL |
|---|---|---|---|
| A | @ | 185.199.108.153 | Default / 1 hour |
| A | @ | 185.199.109.153 | Default / 1 hour |
| A | @ | 185.199.110.153 | Default / 1 hour |
| A | @ | 185.199.111.153 | Default / 1 hour |
| CNAME | www | nolawi.github.io | Default / 1 hour |

Use nolawi.github.io without a protocol, path, or repository name. Replace the
existing www record rather than leaving conflicting CNAMEs. Existing AAAA or
forwarding settings for these exact website hosts should be checked if resolution
continues to point elsewhere; do not delete unrelated records. No paid hosting,
email, premium DNS or SSL add-on is needed for this GitHub Pages site.

Reference: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## 2. Codex: verify DNS and prepare the domain release

After DNS is saved, verify apex/www resolution. Update `public/CNAME`, canonical
site URL, robots/sitemap generation, social preview URLs, deployment docs, and
Meta login/privacy/deletion URLs actually in use. Confirm any necessary Meta
redirects through the account's supported UI; do not silently break authentication.
Run tests and build, then update repository Settings → Pages → Custom domain to
logcabinscout.com. The source remains nolawi/logcabinscout with Actions deployment.

Deploy the matching build through the manual website workflow, then verify the
new domain's certificate, HTTPS enforcement, www canonical behavior, assets,
listing feed, photo loading, Instagram/source links, search and saved cabins.
Certificate provisioning and DNS propagation may take time; report the actual
status rather than promising an exact completion time.

## 3. Owner + Codex: connect the profile and finish tracking

Manually set the Instagram profile website to https://logcabinscout.com/ after
HTTPS is working. Keep captions linked to original property listings. Record the
real purchase/renewal dates, costs and auto-renew preference; create reminders
when the dates/service are known.

Status: DNS, Pages assignment, deployment and HTTPS verified. Profile URL and renewal tracking remain open.
