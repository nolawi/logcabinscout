# Source-backed public discovery

`npm run discover:public -- NC 6` searches public Zillow state pages for log-cabin
keywords and inspects at most six new listing pages. It does not call RentCast,
require a key, or incur paid API charges. It is a manual complement to the bounded
RentCast workflow, not a replacement nationwide inventory or a scheduled scraper.

The command accepts any supported two-letter US state and a listing-page limit
from 1–10 (default 6). It reads region information from the actual state page,
then follows real result links. The request cap is two search/setup pages plus
the selected listing-page limit, with no retries. A blocked/unavailable page or
unsupported source layout stops the run and saves partial candidates. It does
not bypass access restrictions or invent listing URLs.

Before inspecting details it skips IDs already in reviewed data, duplicate links,
other states, non-single-family results, and inactive results. Description evidence
must indicate log construction, rather than merely a Log Cabin Road address or
log siding. Sentences referring only to guest, detached, storage, or secondary
buildings are excluded. These heuristics can miss valid properties or still need
human judgment: output remains `needs-review` and `verified: false`.

Output: `artifacts/public-candidates-STATE.json`, ignored by Git. Only candidate
facts, source URLs, and short construction evidence are retained; raw page caches,
credentials, contact details, and hidden page tokens are not copied to output.
Use the existing review tool:

```bash
npm run review -- queue artifacts/public-candidates-NC.json
```

Approved records can inherit sourced prices, acreage, bedrooms, bathrooms,
square footage, and source links. A review timestamp must still be provided;
source-state abbreviations are normalized to full state names. Nothing is
published by the discovery command itself.

## Home details

The feed and cards support optional `bedrooms`, `bathrooms`, and `squareFeet`.
Unknown values are null/omitted in the UI. Studios and fractional bath counts are
preserved; invalid negative counts or unsupported area units are not invented.
Square footage is taken only from an explicit square-feet unit or the listing's
structured summary metadata. Review edits validate those fields, and RentCast
candidates also retain its bedrooms, bathrooms, and square-footage fields.

Public website layouts can change; parser failures should be diagnosed before
re-running. This process makes no completeness or continuous-availability claim.
