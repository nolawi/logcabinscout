// Weekly rotation spreads a limited API budget across a small set of states.
// This is sampling, NOT complete national coverage.
export const STATES = Object.freeze(['VA', 'WV', 'NC', 'TN', 'PA', 'NY', 'CO', 'MT', 'ID', 'WA']);

export function weekIndex(date) {
  const stamp = date instanceof Date ? date.getTime() : new Date(date).getTime();
  if (!Number.isFinite(stamp)) throw new Error('Invalid date');
  // Use UTC Monday-to-Sunday weeks; Jan 5, 1970 was Monday.
  return Math.floor((stamp - 4 * 24 * 60 * 60 * 1000) / (7 * 24 * 60 * 60 * 1000));
}

export function stateForWeek(date = new Date()) {
  return STATES[((weekIndex(date) % STATES.length) + STATES.length) % STATES.length];
}
