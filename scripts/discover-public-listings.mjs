import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { STATES } from './lib/discovery-schedule.mjs';
import { searchState, searchCandidates, listingCandidate } from './lib/public-listings.mjs';
const execute = promisify(execFile);
const [stateInput, limitInput = '6'] = process.argv.slice(2);
const state = stateInput?.toUpperCase();
const limit = Number(limitInput);
if (!STATES.includes(state) || !Number.isInteger(limit) || limit < 1 || limit > 10) throw new Error('Usage: npm run discover:public -- STATE [1-10 listing pages, default 6]');
let requests = 0;
async function page(url) {
  requests++;
  try {
    const { stdout } = await execute('curl', ['--fail', '--silent', '--show-error', '--location', '--max-time', '25', url], { maxBuffer: 12 * 1024 * 1024 });
    return stdout;
  } catch { throw new Error('Source page unavailable; no retries made'); }
}
const reviewed = JSON.parse(await readFile(new URL('../data/reviewed-listings.json', import.meta.url), 'utf8'));
const known = new Set(reviewed.flatMap(row => [row.id, row.discoveryId]).filter(Boolean));
const candidates = [];
let inspected = 0;
try {
  const base = `https://www.zillow.com/${state.toLowerCase()}/`;
  const query = searchState(await page(base));
  const search = await page(`${base}?searchQueryState=${encodeURIComponent(JSON.stringify(query))}`);
  const links = searchCandidates(search, state, known).slice(0, limit);
  for (const link of links) {
    const candidate = listingCandidate(await page(link.url), link.url);
    inspected++;
    if (candidate?.state === state) candidates.push(candidate);
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
const output = new URL(`../artifacts/public-candidates-${state}.json`, import.meta.url);
await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
await writeFile(output, JSON.stringify({ retrievedAt: new Date().toISOString(), state, candidates }, null, 2) + '\n');
console.log(JSON.stringify({ state, sourceRequests: requests, listingPagesInspected: inspected, candidatesForReview: candidates.length, paidApiRequests: 0, published: 0, output: output.pathname }, null, 2));
