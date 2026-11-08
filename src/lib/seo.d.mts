export const SITE_URL: string;
export const SITE_TITLE: string;
export const SITE_DESCRIPTION: string;
export function serializeJson(value: unknown): string;
export function structuredData(listings: Array<{title: string; location: string; listingUrl?: string}>): unknown;
