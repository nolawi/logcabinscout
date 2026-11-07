/**
 * Convert explicitly reviewed, sourced active listings into the public feed.
 * Does not call RentCast. Do not treat architectural data alone as final review.
 */
const validHttps = (value) => {
  if (typeof value !== 'string') return false;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
};

export function buildFeed(input, today = new Date()) {
  if (!Array.isArray(input)) throw new Error('Expected an array of reviewed listings');
  const unique = new Map();
  for (const item of input) {
    if (!item || typeof item !== 'object') continue;
    if (item.verified !== true || item.status !== 'active') continue;
    if (typeof item.id !== 'string' || !item.id.trim()) continue;
    if (typeof item.title !== 'string' || !item.title.trim()) continue;
    if (typeof item.location !== 'string' || !item.location.trim()) continue;
    if (typeof item.price !== 'number' || !Number.isFinite(item.price) || item.price < 0) continue;
    if (!validHttps(item.listingUrl)) continue;
    const checked = new Date(item.lastCheckedAt);
    if (!Number.isFinite(checked.getTime())) continue;
    const ageMs = today.getTime() - checked.getTime();
    if (ageMs < 0 || ageMs > 30 * 24 * 3600 * 1000) continue;
    if (unique.has(item.id)) continue;
    unique.set(item.id, {
      id: item.id,
      title: item.title.trim(),
      location: item.location.trim(),
      price: item.price,
      acreage: typeof item.acreage === 'number' && Number.isFinite(item.acreage) && item.acreage >= 0 ? item.acreage : null,
      propertyType: 'Log cabin',
      listingUrl: item.listingUrl,
      imageUrl: validHttps(item.imageUrl) ? item.imageUrl : undefined,
      verified: true,
    });
  }
  return [...unique.values()];
}
