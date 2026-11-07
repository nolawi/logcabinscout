// Weekly rotation spreads a limited API budget across all 50 US states.
// This is sampling, NOT complete national coverage.
export const STATES = Object.freeze(['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY']);

export function weekIndex(date) {
  const stamp = date instanceof Date ? date.getTime() : new Date(date).getTime();
  if (!Number.isFinite(stamp)) throw new Error('Invalid date');
  // Use UTC Monday-to-Sunday weeks; Jan 5, 1970 was Monday.
  return Math.floor((stamp - 4 * 24 * 60 * 60 * 1000) / (7 * 24 * 60 * 60 * 1000));
}

export function stateForWeek(date = new Date()) {
  return STATES[((weekIndex(date) % STATES.length) + STATES.length) % STATES.length];
}
