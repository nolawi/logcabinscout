# Domain shortlist and price check — November 28, 2026

Research recommendation (superseded by owner preference for GoDaddy):
**logcabinscout.com**, registered for one year at **Porkbun** if
checkout confirms ordinary availability and the expected total. It matches the
project name and @logcabinscout, needs no spelling explanation, and fits the
planned budget without relying on a large first-year discount.

No name has been purchased, reserved, selected by the owner, or connected to DNS.

## Name checks

| Candidate | Registry lookup observed | Recommendation |
|---|---|---|
| logcabinscout.com | Verisign .com RDAP endpoint returned HTTP 404 with no registration record | First choice; confirm actual registrar availability and non-premium checkout price |
| scoutlogcabins.com | Same .com RDAP result | Backup .com, but reverses the brand wording |
| logcabinscout.net | Verisign .net RDAP endpoint returned HTTP 404 with no registration record | Backup only; .com is a better fit if available |
| logcabinscout.co | RDAP.org returned a structured errorCode 404 | Not preferred: possible confusion with .com and substantially higher renewal cost |

RDAP results indicate no registration record was returned. They are not a
registrar availability guarantee: names can be reserved, premium, unavailable,
or registered after the check. The .com/.net responses did not contain a JSON
record; no stronger availability claim is made.

Sources:
- https://rdap.verisign.com/com/v1/domain/logcabinscout.com
- https://rdap.verisign.com/com/v1/domain/scoutlogcabins.com
- https://rdap.verisign.com/net/v1/domain/logcabinscout.net
- https://rdap.org/domain/logcabinscout.co

## Registrar comparison (USD, standard non-premium .com)

| Registrar | First year observed | Renewal observed | Conditions |
|---|---|---|---|
| Porkbun | $11.81 standard | $11.81/year | Official table and public pricing API agree. Pricing page says ICANN/other fees included; free WHOIS privacy listed. Confirm checkout and any location-specific taxes. |
| Namecheap | $6.48 advertised new-customer promo; regular table shows $12.08 | $19.98/year | Promo requires eligibility and code NEWCOM648, limited to one new-customer first-year registration. Page lists a $0.20 ICANN fee where applicable. Estimated promo total $6.68 or table total $12.28 before any other checkout tax; renewal about $20.18 with that fee. |

Namecheap's page displays multiple first-year offers, including a separate $8.98
banner. Treat those as competing conditional advertisements, not a guaranteed
checkout quote. Check eligibility and the actual one-year cart. The renewal
comparison is why Porkbun is the simpler recommendation despite its higher
first-year price than the advertised eligible promo.

Porkbun's public API also lists a possible $1 registration coupon, but eligibility
was not tested and the recommendation does not depend on receiving it.
Porkbun's .co API price was $2.37 first year and $31.20 renewal, illustrating why
we should compare renewals instead of picking the cheapest initial extension.
Dynadot's .com page could not be fetched in this check, so no unverified Dynadot
quote is included. All prices can change; these are observed published rates,
not a completed checkout or a locked future renewal rate.

Official sources:
- https://porkbun.com/products/domains
- https://api.porkbun.com/api/json/v3/pricing/get
- https://www.namecheap.com/domains/registration/gtld/com/

## Concrete next action

The owner selects the domain/registrar, signs into their registrar account, and
confirms the exact **one-year** checkout total. Skip hosting, paid SSL, premium
DNS, and email add-ons initially; GitHub Pages hosting/HTTPS already exists.
Do not silently accept a multi-year term or a premium-resale price.

After purchase, record registration/renewal dates, the receipt amount, the quoted
renewal rate, the chosen auto-renew setting, and 60-/30-day reminder dates in
`domain-register.csv`. Never store payment details or registrar credentials here.
Then follow LCS-02/03's DNS/HTTPS, canonical/Meta URL, profile-link, rollback and
elancabin.com transition checklist. The temporary domain stays live throughout.

Research tasks 01a–01c are complete enough for a purchase decision. LCS-01 itself
remains Ready because checkout, owner selection, registration and tracking are
not complete. No application changes, deployment, or purchases were made.

Owner decision: use GoDaddy instead. Its live cart and renewal quote have not
been inspected. Published Porkbun/Namecheap prices above do not apply to GoDaddy.
