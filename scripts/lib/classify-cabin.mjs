/**
 * Identify probable log construction using RentCast county property records.
 * We intentionally avoid treating generic wood siding, fireplaces, or mountain
 * locations as evidence of log construction.
 */
export function classifyCabin(property) {
  const features = property?.features ?? {};
  const architecture = tokenize(features.architectureType);
  const exterior = tokenize(features.exteriorType);
  const evidence = [];
  if (architecture.includes('log cabin')) evidence.push('Architecture: Log Cabin');
  if (exterior.includes('log')) evidence.push('Exterior: Log');
  const strong = evidence.length > 0;

  if (strong) return { classification: 'log-cabin', verified: true, evidence };

  // Architectural Cabin and Chalet can be frame-built, not necessarily logs.
  if (architecture.includes('cabin') || architecture.includes('chalet')) {
    return { classification: 'possible-cabin', verified: false, evidence: ['Cabin-like architecture; log construction unconfirmed'] };
  }
  return { classification: 'not-confirmed', verified: false, evidence: [] };
}

function tokenize(input) {
  if (typeof input !== 'string') return [];
  return input.split('/').map(value => value.trim().toLowerCase()).filter(Boolean);
}
