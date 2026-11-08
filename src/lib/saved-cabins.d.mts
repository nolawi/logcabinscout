export const SAVED_CABINS_KEY: string;
export function parseSavedCabins(raw: string | null): string[];
export function toggleSavedCabin(saved: readonly string[], id: string): string[];
