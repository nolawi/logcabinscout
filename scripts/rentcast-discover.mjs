/** Review-only sampling: at most four API attempts, never automatic publication. */
import { mkdir, writeFile, readFile, rename } from 'node:fs/promises';
import { createRentCastClient, discover } from './lib/discover.mjs';
import { emptyHistory, parseHistory } from './lib/discovery-history.mjs';
import { STATES } from './lib/discovery-schedule.mjs';

const key = process.env.RENTCAST_API_KEY;
const state = (process.env.RENTCAST_STATE || 'VA').trim().toUpperCase();
if (!key) throw new Error('Missing RENTCAST_API_KEY environment variable.');
if (!STATES.includes(state)) throw new Error('Use a valid two-letter US state abbreviation.');
const client = createRentCastClient(key);
try {
  const historyPath = new URL('../artifacts/history.json', import.meta.url);
  let history = emptyHistory();
  try { history = parseHistory(JSON.parse(await readFile(historyPath, 'utf8'))); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const persist = async value => {
    await mkdir(new URL('../artifacts/', import.meta.url), { recursive: true });
    const temporary = new URL('../artifacts/history.json.tmp', import.meta.url);
    await writeFile(temporary, JSON.stringify(value, null, 2) + '\n');
    await rename(temporary, historyPath);
  };
  await persist(history);
  const { candidates, summary } = await discover(state, client, new Date(), history, persist);
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
