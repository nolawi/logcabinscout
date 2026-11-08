export const SAVED_CABINS_KEY = 'logcabinscout.savedCabins.v1';
export function parseSavedCabins(raw) {
  try {
    const value = JSON.parse(raw ?? '[]');
    return Array.isArray(value) ? [...new Set(value.filter(id => typeof id === 'string' && id.trim()))] : [];
  } catch { return []; }
}
export function toggleSavedCabin(saved, id) {
  return saved.includes(id) ? saved.filter(value => value !== id) : [...saved, id];
}
