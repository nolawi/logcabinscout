export const SITE_URL = 'https://elancabin.com/';
export const SITE_TITLE = 'Log Cabins for Sale | Log Cabin Scout';
export const SITE_DESCRIPTION = 'Browse a curated collection of log cabins for sale. Compare property photos, prices, and acreage, with direct links to the original listings.';

/** Safe for inline application/json and JSON-LD script elements. */
export const serializeJson = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
export function structuredData(listings) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': SITE_URL + '#website', url: SITE_URL, name: 'Log Cabin Scout', description: SITE_DESCRIPTION, inLanguage: 'en-US' },
      {
        '@type': 'CollectionPage', '@id': SITE_URL + '#collection', url: SITE_URL,
        name: SITE_TITLE, description: SITE_DESCRIPTION, isPartOf: { '@id': SITE_URL + '#website' },
        mainEntity: {
          '@type': 'ItemList', numberOfItems: listings.length,
          itemListElement: listings.map((listing, index) => ({
            '@type': 'ListItem', position: index + 1, name: `${listing.title}, ${listing.location}`, url: listing.listingUrl,
          })),
        },
      },
    ],
  };
}
