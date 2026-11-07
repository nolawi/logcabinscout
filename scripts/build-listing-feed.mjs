import { readFile, writeFile } from 'node:fs/promises';
import { buildFeed } from './lib/build-feed.mjs';

const source = JSON.parse(await readFile(new URL('../data/reviewed-listings.json', import.meta.url), 'utf8'));
const feed = buildFeed(source);
await writeFile(new URL('../public/listings.json', import.meta.url), JSON.stringify(feed, null, 2) + '\n');
console.log(`Published ${feed.length} reviewed, active listings to public/listings.json`);
