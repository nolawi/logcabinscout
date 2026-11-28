/** Public permalinks only; account tokens and queue operations never reach the UI. */
export function publishedInstagramLinks(history: unknown): ReadonlyMap<string, string> {
  const links = new Map<string, string>();
  if (!history || typeof history !== 'object' || !('posts' in history) || !Array.isArray(history.posts)) return links;
  for (const value of history.posts) {
    if (!value || typeof value !== 'object') continue;
    const post = value as Record<string, unknown>;
    if (post.state !== 'published' || typeof post.listingId !== 'string' || !post.listingId.trim() ||
        typeof post.permalink !== 'string' || !/^https:\/\/(?:www\.)?instagram\.com\/(?:p|reel)\/[A-Za-z0-9_-]+\/$/.test(post.permalink)) continue;
    links.set(post.listingId, post.permalink);
  }
  return links;
}

export function withInstagramLinks<T extends { id: string }>(listings: readonly T[], links: ReadonlyMap<string, string>): (T & { instagramUrl?: string })[] {
  return listings.map(listing => ({ ...listing, instagramUrl: links.get(listing.id) }));
}
