import { readFile, writeFile, rename, rm, mkdir, open } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { candidateQueue, reviewChange, validateReviewed } from './lib/review-listings.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourcePath = resolve(root, 'data/reviewed-listings.json');
const feedPath = resolve(root, 'public/listings.json');
const readJson = async path => JSON.parse(await readFile(path, 'utf8'));
const usage = `Local listing review (no API calls). Paths are relative to the current directory.
  npm run review -- list
  npm run review -- queue <candidates.json-or-history.json>
  npm run review -- approve <candidate-file> <candidate-id> <details.json> [--write]
  npm run review -- update <reviewed-id> <details.json> [--write]
  npm run review -- status <reviewed-id> <sold|pending|off_market> [--write]
Changes preview by default; --write saves the reviewed source and regenerated feed.
Approvals require an explicit lastCheckedAt in the details file; dates are never renewed automatically.`;

async function savePair(original, result) {
  const suffix = `.review-${randomUUID()}.tmp`;
  const sourceTmp = sourcePath + suffix;
  const feedTmp = feedPath + suffix;
  try {
    await writeFile(sourceTmp, JSON.stringify(result.reviewed, null, 2) + '\n', {flag:'wx'});
    await writeFile(feedTmp, JSON.stringify(result.feed, null, 2) + '\n', {flag:'wx'});
    if (await readFile(sourcePath, 'utf8') !== original) throw new Error('Reviewed source changed while preparing review; retry');
    await rename(sourceTmp, sourcePath);
    try { await rename(feedTmp, feedPath); }
    catch (error) {
      await writeFile(sourceTmp, original);
      await rename(sourceTmp, sourcePath);
      throw error;
    }
  } finally { await Promise.all([rm(sourceTmp,{force:true}), rm(feedTmp,{force:true})]); }
}

async function main() {
  const args = process.argv.slice(2);
  if (!args.length || args.includes('--help')) { console.log(usage); return; }
  const write = args.includes('--write');
  const positional = args.filter(arg => arg !== '--write');
  const [action, ...values] = positional;
  if (!['list', 'queue', 'approve', 'update', 'status'].includes(action)) throw new Error(usage);
  const expected = {list:0, queue:1, approve:3, update:2, status:2}[action];
  if (values.length !== expected || (write && ['list','queue'].includes(action))) throw new Error(usage);
  const lockPath = resolve(root, 'artifacts/review.lock');
  let lock;
  try {
    if (write) {
      await mkdir(dirname(lockPath), {recursive:true});
      lock = await open(lockPath, 'wx');
    }
    const original = await readFile(sourcePath, 'utf8');
    const reviewed = JSON.parse(original);
    validateReviewed(reviewed);
    if (action === 'list') { console.table(reviewed.map(({id,title,status,lastCheckedAt}) => ({id,title,status,lastCheckedAt}))); return; }
    if (action === 'queue') {
      const queue = candidateQueue(await readJson(resolve(values[0])), reviewed);
      console.table(queue.map(({id,address,classification,reviewedId}) => ({id,address,classification,reviewedId})));
      console.log(`${queue.filter(item => !item.reviewedId).length} candidates awaiting review.`);
      return;
    }
    const command = action === 'approve'
      ? {action, candidates:await readJson(resolve(values[0])), id:values[1], details:await readJson(resolve(values[2]))}
      : action === 'update' ? {action, id:values[0], details:await readJson(resolve(values[1]))}
      : {action, id:values[0], status:values[1]};
    const result = reviewChange(reviewed, command);
    if (write) await savePair(original, result);
    console.log(JSON.stringify({mode:write?'saved':'preview', action, id:command.id, reviewed:result.reviewed, feed:result.feed}, null, 2));
  } finally {
    if (lock) { await lock.close(); await rm(lockPath,{force:true}); }
  }
}
main().catch(error => { console.error(error.code === 'EEXIST' ? 'Another review is writing. Wait for it to finish; remove artifacts/review.lock only if that process stopped.' : error.message); process.exitCode = 1; });
