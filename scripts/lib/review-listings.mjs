import { buildFeed } from './build-feed.mjs';
import { parsePhoto } from '../../src/lib/photo.mjs';

const fields = new Set(['title', 'location', 'price', 'acreage', 'listingUrl', 'lastCheckedAt', 'photo']);
export function validateReviewed(rows) {
  if (!Array.isArray(rows) || rows.some(row => !row || typeof row.id !== 'string' || !row.id.trim()) || new Set(rows.map(row => row.id)).size !== rows.length) throw new Error('Invalid or duplicate reviewed listing IDs');
}
export function candidateQueue(input, reviewed) {
  validateReviewed(reviewed);
  const candidates = Array.isArray(input?.candidates) ? input.candidates : input?.version === 1 && input.entries
    ? Object.values(input.entries).flatMap(entry => entry.candidate ? [entry.candidate] : []) : null;
  if (!candidates) throw new Error('Expected candidates.json or discovery history.json');
  const unique = new Map();
  for (const candidate of candidates) {
    if (!candidate || typeof candidate.id !== 'string' || !candidate.id.trim() || typeof candidate.address !== 'string' || !candidate.address.trim() || candidate.status !== 'needs-review' || candidate.verified !== false) throw new Error('Invalid review candidate');
    if (unique.has(candidate.id)) continue;
    unique.set(candidate.id, {
      ...candidate,
      reviewedId: reviewed.find(row => row.id === candidate.id || row.discoveryId === candidate.id)?.id ?? null,
    });
  }
  return [...unique.values()];
}
function detailsPatch(details, allowId) {
  if (!details || typeof details !== 'object' || Array.isArray(details)) throw new Error('Expected a details object');
  for (const field of Object.keys(details)) if (!fields.has(field) && !(allowId && field === 'id')) throw new Error(`Unsupported details field: ${field}`);
  return details;
}
function validateListing(row, now) {
  if (buildFeed([{ ...row, status: 'active', verified: true }]).length !== 1) throw new Error('Listing requires title, location, price, HTTPS listing URL, and a valid UTC lastCheckedAt');
  if (Date.parse(row.lastCheckedAt) > now) throw new Error('lastCheckedAt cannot be in the future');
  if (row.acreage !== undefined && row.acreage !== null && (typeof row.acreage !== 'number' || !Number.isFinite(row.acreage) || row.acreage < 0)) throw new Error('Acreage must be null or a nonnegative number');
  if (row.photo !== undefined && row.photo !== null && !parsePhoto(row.photo)) throw new Error('Photo requires URL, alt text, credit, source URL, width, and height');
}

/** Explicit review commands change local JSON only; nothing is fetched or deployed. */
export function reviewChange(reviewed, command, now = Date.now()) {
  validateReviewed(reviewed);
  const rows = structuredClone(reviewed);
  if (command.action === 'approve') {
    const candidate = candidateQueue(command.candidates, rows).find(item => item.id === command.id);
    if (!candidate) throw new Error('Candidate not found');
    if (candidate.reviewedId) throw new Error('Candidate already reviewed; use update');
    const details = detailsPatch(command.details, true);
    const row = {
      id: candidate.id, title: candidate.address,
      location: [candidate.city, candidate.state].filter(Boolean).join(', '),
      price: candidate.price, acreage: null, ...details,
      discoveryId: candidate.id, status: 'active', verified: true,
    };
    if (rows.some(existing => existing.id === row.id)) throw new Error('Reviewed listing ID already exists');
    validateListing(row, now);
    rows.push(row);
  } else {
    const index = rows.findIndex(row => row.id === command.id);
    if (index < 0) throw new Error('Reviewed listing not found');
    if (command.action === 'update') {
      rows[index] = { ...rows[index], ...detailsPatch(command.details, false) };
      validateListing(rows[index], now);
    } else if (command.action === 'status') {
      if (!['sold', 'pending', 'off_market'].includes(command.status)) throw new Error('Status must be sold, pending, or off_market');
      rows[index].status = command.status;
    } else throw new Error('Unknown review action');
  }
  validateReviewed(rows);
  return { reviewed: rows, feed: buildFeed(rows) };
}
