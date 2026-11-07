import { parsePhoto } from './photo.mjs';
import type { Cabin } from '../types/cabin';

type ListingRecord = Record<string, unknown>;

const string = (value: unknown): string => typeof value === 'string' ? value.trim() : '';
const number = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;

function safeUrl(value: unknown): string | undefined {
  const raw = string(value);
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/** Validates data before it reaches the public listing UI. */
export const MAX_LISTING_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function parseListings(input: unknown, now = Date.now()): Cabin[] {
  if (!Array.isArray(input)) throw new Error('Expected a listing array');
  const seen = new Set<string>();
  const listings: Cabin[] = [];

  for (const entry of input) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
    const item = entry as ListingRecord;
    const id = string(item.id);
    const title = string(item.title);
    const location = string(item.location);
    const price = number(item.price);
    const listingUrl = safeUrl(item.listingUrl);

    const lastCheckedAt = string(item.lastCheckedAt);
    const checked = Date.parse(lastCheckedAt);
    const age = now - checked;
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(lastCheckedAt) ||
        !Number.isFinite(checked) ||
        new Date(checked).toISOString().replace('.000Z', 'Z') !== lastCheckedAt.replace('.000Z', 'Z') ||
        age < 0 || age >= MAX_LISTING_AGE_MS) continue;

    // Never publish unverified, unsourced, or duplicate records.
    if (!id || seen.has(id) || !title || !location || price === null ||
        item.verified !== true || !listingUrl) continue;

    seen.add(id);
    listings.push({
      id, title, location, price,
      acreage: number(item.acreage),
      propertyType: string(item.propertyType) || 'Log cabin',
      listingUrl,
      photo: parsePhoto(item.photo),
      isSample: false,
      lastCheckedAt: new Date(checked).toISOString(),
    });
  }

  return listings;
}
