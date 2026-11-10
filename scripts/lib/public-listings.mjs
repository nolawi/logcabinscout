/** Public listing-page parsing only. No credentials, hidden endpoints, or auto-publication. */
export function pageData(html) {
  const match = html.match(/<script\b(?=[^>]*\bid=["']__NEXT_DATA__["'])[^>]*>([\s\S]*?)<\/script>/i);
  if (!match) throw new Error('Unsupported source page: no structured page data');
  return JSON.parse(match[1]);
}
export function searchState(html) {
  const query = pageData(html)?.props?.pageProps?.searchPageState?.queryState;
  if (!query?.regionSelection?.length) throw new Error('Unsupported source search layout');
  return { ...query, filterState: { ...query.filterState, keywords: { value: 'log cabin' } } };
}
export function searchCandidates(html, state, knownIds = new Set()) {
  const results = pageData(html)?.props?.pageProps?.searchPageState?.cat1?.searchResults?.listResults;
  if (!Array.isArray(results)) throw new Error('Unsupported source search results');
  const unique = new Map();
  for (const row of results) {
    const info = row?.hdpData?.homeInfo;
    if (!info || info.state !== state || info.homeStatus !== 'FOR_SALE' || info.homeType !== 'SINGLE_FAMILY') continue;
    const id = `zillow:${row.zpid}`;
    if (knownIds.has(id)) continue;
    try {
      const url = new URL(row.detailUrl);
      if (url.protocol !== 'https:' || url.hostname !== 'www.zillow.com' || url.username || url.password || !url.pathname.includes(`/${row.zpid}_zpid/`)) continue;
      unique.set(id, { id, url: url.href });
    } catch { /* Ignore unsupported result links. */ }
  }
  return [...unique.values()];
}

export function cabinEvidence(description) {
  if (typeof description !== 'string') return [];
  const sentences = description.split(/(?<=[.!?])\s+|\n+/);
  const log = /\blog[ -](?:cabin|home|house)\b|\bd-log\b|\b(?:solid|hand.hewn|full)[ -]logs?\b/i;
  const accessory = /\b(?:guest|secondary|outbuilding|shed|storage|treehouse|unfinished|solar powered|detached)\b/i;
  const negative = /\bnot (?:a |an )?(?:log|cabin)|\blog[ -]siding\b|\blog cabin (?:road|rd|lane|ln|drive|dr)\b/i;
  return sentences.filter(text => log.test(text) && !accessory.test(text) && !negative.test(text))
    .slice(0, 2).map(text => text.trim().slice(0, 220));
}
function propertyFrom(cache, zpid) {
  if (!cache || typeof cache !== 'object') return undefined;
  if (String(cache.zpid) === zpid && 'description' in cache) return cache;
  for (const value of Object.values(cache)) {
    const result = propertyFrom(value, zpid);
    if (result) return result;
  }
}
const number = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
export function squareFeetFrom(property, html) {
  if (/square feet|sq\.?\s*ft\.?/i.test(property.livingAreaUnits ?? property.livingAreaUnitsShort ?? '')) return number(property.livingArea);
  const description = html.match(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*\bcontent=(["'])(.*?)\1/i)?.[2] ?? '';
  const measured = description.match(/([\d,]+(?:\.\d+)?)\s*(?:sq\.?\s*ft\.?|square feet)/i)?.[1];
  return measured ? number(Number(measured.replaceAll(',', ''))) : null;
}
export function listingCandidate(html, url) {
  const source = new URL(url);
  const zpid = source.pathname.match(/\/(\d+)_zpid\//)?.[1];
  if (source.protocol !== 'https:' || source.hostname !== 'www.zillow.com' || !zpid) throw new Error('Unsupported listing URL');
  const data = pageData(html)?.props?.pageProps?.componentProps?.gdpClientCache;
  const property = propertyFrom(typeof data === 'string' ? JSON.parse(data) : data, zpid);
  if (!property) throw new Error('Unsupported source property layout');
  const evidence = cabinEvidence(property.description);
  const status = property.attributionInfo?.trueStatus ?? '';
  if (!['SINGLE_FAMILY', 'SingleFamily'].includes(property.homeType) || property.homeStatus !== 'FOR_SALE' || /pending|contract|contingent|sold/i.test(status) || evidence.length === 0) return null;
  const address = property.address ?? property;
  if (!address.streetAddress || !address.city || !address.state || number(property.price) === null) return null;
  const lot = property.resoFacts?.lotSize;
  const acres = typeof lot === 'string' && /^\s*[\d,.]+\s+acres?\s*$/i.test(lot) ? Number.parseFloat(lot.replaceAll(',', '')) : null;
  return {
    id: `zillow:${zpid}`, source: 'Zillow', address: address.streetAddress,
    city: address.city, state: address.state, price: property.price, acreage: acres,
    bedrooms: Number.isInteger(property.bedrooms) ? number(property.bedrooms) : null,
    bathrooms: number(property.bathrooms),
    squareFeet: squareFeetFrom(property, html),
    listingUrl: source.href, classification: 'possible-cabin', evidence,
    status: 'needs-review', verified: false,
  };
}

/** Gallery URLs are grouped by actual photo, not by resolution variant. */
export function listingGallery(html, url) {
  const listing = listingCandidate(html, url);
  if (!listing) throw new Error('Listing is no longer an eligible active log cabin.');
  const zpid = new URL(url).pathname.match(/\/(\d+)_zpid\//)[1];
  const cache = pageData(html)?.props?.pageProps?.componentProps?.gdpClientCache;
  const property = propertyFrom(typeof cache === 'string' ? JSON.parse(cache) : cache, zpid);
  const gallery = property.originalPhotos ?? property.responsivePhotosOriginalRatio ?? property.responsivePhotos ?? [];
  const photos = gallery.map(photo => {
    const variants = [...(photo.mixedSources?.jpeg ?? [])].sort((a,b) => b.width-a.width);
    return variants.map(item => item.url).find(value => {
      try { const u = new URL(value); return u.protocol === 'https:' && u.hostname === 'photos.zillowstatic.com' && !u.username && !u.password; } catch { return false; }
    });
  }).filter(Boolean);
  if (photos.length < 4) throw new Error('Listing does not have four usable source photos.');
  return { listing, photos };
}
