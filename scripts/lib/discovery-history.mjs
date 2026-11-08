import { createHash } from 'node:crypto';
export const HISTORY_TTL_MS = 90 * 86400000;
const classifications = new Set(['log-cabin', 'possible-cabin', 'not-confirmed']);
export const historyKey = (state, address) => `${state}:${createHash('sha256').update(address.trim().replace(/\s+/g, ' ').toLowerCase()).digest('hex')}`;
export const emptyHistory = () => ({ version: 1, entries: {} });

/** Invalid saved history fails before spending API requests; expired entries are pruned. */
export function parseHistory(input, now = Date.now()) {
  if (!input || input.version !== 1 || !input.entries || typeof input.entries !== 'object' || Array.isArray(input.entries)) throw new Error('Invalid discovery history');
  const history = emptyHistory();
  for (const [key, entry] of Object.entries(input.entries)) {
    const stamp = Date.parse(entry?.checkedAt);
    if (!/^[A-Z]{2}:[a-f0-9]{64}$/.test(key) || !Number.isFinite(stamp) || stamp > now ||
        !classifications.has(entry?.classification) || !Array.isArray(entry.evidence) ||
        !entry.evidence.every(value => typeof value === 'string')) throw new Error('Invalid discovery history entry');
    if (now - stamp >= HISTORY_TTL_MS) continue;
    if (entry.candidate && (entry.candidate.status !== 'needs-review' || entry.candidate.verified !== false ||
        !Number.isFinite(Date.parse(entry.candidate.firstSeenAt)) || !Number.isFinite(Date.parse(entry.candidate.lastSeenAt)))) throw new Error('Invalid discovery candidate history');
    history.entries[key] = {
      checkedAt: entry.checkedAt, classification: entry.classification, evidence: entry.evidence,
      ...(entry.candidate ? {candidate: entry.candidate} : {}),
    };
  }
  return history;
}
