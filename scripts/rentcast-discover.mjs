/** Review-only sampling: at most four API attempts, never automatic publication. */
import { mkdir, writeFile } from 'node:fs/promises';
import { createRentCastClient, discover } from './lib/discover.mjs';
import { STATES } from './lib/discovery-schedule.mjs';

const key = process.env.RENTCAST_API_KEY;
const state = (process.env.RENTCAST_STATE || 'VA').trim().toUpperCase();
if (!key) throw new Error('Missing RENTCAST_API_KEY environment variable.');
if (!STATES.includes(state)) throw new Error('Use a valid two-letter US state abbreviation.');
const client = createRentCastClient(key);
try {
  const { candidates, summary } = await discover(state, client);
  await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
  await writeFile(new URL('../artifacts/candidates.json', import.meta.url),
    JSON.stringify({ retrievedAt: new Date().toISOString(), state, summary, candidates }, null, 2) + '\n');
  console.log(JSON.stringify(summary, null, 2));
} catch (error) {
  // Never print keys, response bodies, or raw provider errors.
  console.error(error instanceof Error ? error.message : 'Unexpected RentCast error');
  console.error(`API requests attempted: ${client.attempts}/4. No retries or publication.`);
  process.exitCode = 1;
}
