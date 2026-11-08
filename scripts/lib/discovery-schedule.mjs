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

export const STATE_NAMES = Object.freeze(Object.fromEntries('AL:Alabama|AK:Alaska|AZ:Arizona|AR:Arkansas|CA:California|CO:Colorado|CT:Connecticut|DE:Delaware|FL:Florida|GA:Georgia|HI:Hawaii|ID:Idaho|IL:Illinois|IN:Indiana|IA:Iowa|KS:Kansas|KY:Kentucky|LA:Louisiana|ME:Maine|MD:Maryland|MA:Massachusetts|MI:Michigan|MN:Minnesota|MS:Mississippi|MO:Missouri|MT:Montana|NE:Nebraska|NV:Nevada|NH:New Hampshire|NJ:New Jersey|NM:New Mexico|NY:New York|NC:North Carolina|ND:North Dakota|OH:Ohio|OK:Oklahoma|OR:Oregon|PA:Pennsylvania|RI:Rhode Island|SC:South Carolina|SD:South Dakota|TN:Tennessee|TX:Texas|UT:Utah|VT:Vermont|VA:Virginia|WA:Washington|WV:West Virginia|WI:Wisconsin|WY:Wyoming'.split('|').map(value => value.split(':'))));
