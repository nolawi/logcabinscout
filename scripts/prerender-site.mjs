import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { serializeJson, structuredData, SITE_URL, SITE_TITLE } from '../src/lib/seo.mjs';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { default: App } = await server.ssrLoadModule('/src/App.tsx');
  const { parseListings } = await server.ssrLoadModule('/src/lib/listings.ts');
  const feed = JSON.parse(await readFile(new URL('../public/listings.json', import.meta.url), 'utf8'));
  const renderedAt = Date.now();
  const listings = parseListings(feed, renderedAt);
  const included = new Set(listings.map(item => item.id));
  const initialFeed = { records: feed.filter(item => included.has(item.id)), renderedAt };
  const markup = renderToString(createElement(App, { initialFeed }));
  const path = new URL('../dist/index.html', import.meta.url);
  let html = await readFile(path, 'utf8');
  if (!html.includes('<div id="root"></div>')) throw new Error('Missing prerender root');
  html = html.replace('<div id="root"></div>', () => `<div id="root">${markup}</div><script id="listing-snapshot" type="application/json">${serializeJson(initialFeed)}</script>`);
  html = html.replace('</head>', () => `<script id="site-schema" type="application/ld+json">${serializeJson(structuredData(listings))}</script></head>`);
  await writeFile(path, html);
  await writeFile(new URL('../dist/robots.txt', import.meta.url), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}sitemap.xml\n`);
  await writeFile(new URL('../dist/sitemap.xml', import.meta.url), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${SITE_URL}</loc></url></urlset>\n`);
  console.log(`Prerendered ${listings.length} current listings: ${SITE_TITLE}`);
} finally { await server.close(); }
