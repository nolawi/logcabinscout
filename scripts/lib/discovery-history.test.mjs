import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { discover, createRentCastClient } from './discover.mjs';
import { historyKey, parseHistory, emptyHistory, HISTORY_TTL_MS } from './discovery-history.mjs';
const date = new Date('2026-11-08T12:00:00Z');
const listings = [1,2,3].map(id=>({id:String(id),formattedAddress:`${id} Main Road, VA`,price:200000}));
const clientFor = (rows, exterior='Log') => createRentCastClient('test-key',async url=>({ok:true,json:async()=>url.pathname.endsWith('/sale')?rows:[{features:{exteriorType:exterior}}]}));

test('serialized history avoids repeat enrichment but uses fresh listing prices',async()=>{
  const first=await discover('VA',clientFor(listings),date);
  const reloaded=parseHistory(JSON.parse(JSON.stringify(first.history)),date.getTime());
  const client=clientFor(listings.map(row=>({...row,price:180000})));
  const second=await discover('VA',client,date,reloaded);
  assert.equal(client.attempts,1);
  assert.equal(second.summary.cachedPropertyRecordsReused,3);
  assert.equal(second.summary.propertyRecordsChecked,0);
  assert.equal(Object.keys(second.history.entries).length,3);
  assert.ok(second.candidates.every(row=>row.price===180000 && row.verified===false));
});
test('negative classifications are cached and do not produce candidates',async()=>{
  const first=await discover('VA',clientFor(listings,'Brick'),date);
  const client=clientFor(listings);
  const second=await discover('VA',client,date,first.history);
  assert.equal(client.attempts,1);assert.deepEqual(second.candidates,[]);
});
test('candidate observations update without duplicates or extending classification freshness',async()=>{
  const first=await discover('VA',clientFor(listings),date);
  const later=new Date(date.getTime()+86400000);
  const second=await discover('VA',clientFor(listings),later,first.history);
  assert.equal(Object.keys(second.history.entries).length,3);
  for(const entry of Object.values(second.history.entries)) {
    assert.equal(entry.checkedAt,date.toISOString());
    assert.equal(entry.candidate.firstSeenAt,date.toISOString());
    assert.equal(entry.candidate.lastSeenAt,later.toISOString());
  }
});
test('history expires at 90 days and normalized addresses reuse the same entry',async()=>{
  assert.equal(historyKey('VA','  1  MAIN road, VA '),historyKey('VA','1 main ROAD, va'));
  const first=await discover('VA',clientFor(listings),date);
  assert.equal(Object.keys(parseHistory(first.history,date.getTime()+HISTORY_TTL_MS-1).entries).length,3);
  assert.deepEqual(parseHistory(first.history,date.getTime()+HISTORY_TTL_MS),emptyHistory());
  const client=clientFor(listings);
  await discover('VA',client,new Date(date.getTime()+HISTORY_TTL_MS),first.history);
  assert.equal(client.attempts,4);
});
test('a later provider failure preserves earlier successful work for the next run',async()=>{
  let saved=emptyHistory();let calls=0;
  const client=createRentCastClient('test-key',async url=>{
    calls++;
    if(calls===3) return {ok:false,status:503};
    return {ok:true,json:async()=>url.pathname.endsWith('/sale')?listings:[{features:{exteriorType:'Log'}}]};
  });
  await assert.rejects(discover('VA',client,date,emptyHistory(),async history=>{saved=JSON.parse(JSON.stringify(history));}),/HTTP 503/);
  assert.equal(Object.keys(saved.entries).length,1);
  const next=clientFor(listings);await discover('VA',next,date,saved);
  assert.equal(next.attempts,3);
});
test('corrupt history fails before any API request',async()=>{
  const client=clientFor(listings);
  await assert.rejects(discover('VA',client,date,{version:99,entries:{}}),/Invalid discovery history/);
  assert.equal(client.attempts,0);
  assert.throws(()=>parseHistory({version:1,entries:{bad:{}}},date.getTime()),/Invalid discovery history/);
});

const restore=createRequire(import.meta.url)('../restore-discovery-history.cjs');
const artifact=(id,branch='main')=>({id,name:'rentcast-discovery-history',expired:false,workflow_run:{id,head_branch:branch}});
const fakeRestore = async (artifacts,runs) => {
  const outputs={};
  const github={rest:{actions:{
    getWorkflow:async()=>({data:{id:7}}),
    listArtifactsForRepo:async()=>({data:{artifacts}}),
    getWorkflowRun:async({run_id})=>({data:runs[run_id]}),
  }}};
  await restore({github,context:{repo:{owner:'test',repo:'test'}},core:{setOutput:(key,value)=>{outputs[key]=value;},notice:()=>{}}});
  return outputs;
};
test('restoration selects newest matching main-branch workflow artifact, including failed runs',async()=>{
  const outputs=await fakeRestore([artifact(1),artifact(2),artifact(3,'feature'),artifact(4)],{
    4:{id:4,workflow_id:99,head_branch:'main',event:'workflow_dispatch'},
    2:{id:2,workflow_id:7,head_branch:'main',event:'workflow_dispatch',conclusion:'failure'},
    1:{id:1,workflow_id:7,head_branch:'main',event:'schedule'},
  });
  assert.equal(outputs.run_id,'2');
});
test('missing or expired artifacts start clean; restoration API failures are not hidden',async()=>{
  assert.deepEqual(await fakeRestore([{...artifact(1),expired:true}],{}),{});
  await assert.rejects(restore({github:{rest:{actions:{getWorkflow:async()=>{throw new Error('API unavailable');}}}},context:{repo:{owner:'test',repo:'test'}},core:{}}),/API unavailable/);
});

test('CLI saves and reloads history across separate processes without real network calls',async()=>{
  const { mkdtemp, cp, writeFile, readFile, rm } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { spawnSync } = await import('node:child_process');
  const root = await mkdtemp(join(tmpdir(),'discovery-history-'));
  try {
    await cp(new URL('../',import.meta.url),join(root,'scripts'),{recursive:true});
    await writeFile(join(root,'mock.mjs'),`globalThis.fetch = async url => ({ok:true,json:async()=>url.pathname.endsWith('/sale')?${JSON.stringify(listings)}:[{features:{exteriorType:'Log'}}]});`);
    const run=()=>spawnSync(process.execPath,['--import',join(root,'mock.mjs'),join(root,'scripts/rentcast-discover.mjs')],{env:{...process.env,RENTCAST_API_KEY:'fixture-only',RENTCAST_STATE:'VA'},encoding:'utf8'});
    const first=run();assert.equal(first.status,0,first.stderr);
    const second=run();assert.equal(second.status,0,second.stderr);
    assert.equal(JSON.parse(first.stdout).apiRequestsAttempted,4);
    assert.equal(JSON.parse(second.stdout).apiRequestsAttempted,1);
    const saved=JSON.parse(await readFile(join(root,'artifacts/history.json'),'utf8'));
    assert.equal(Object.keys(saved.entries).length,3);
    assert.equal(JSON.stringify(saved).includes('fixture-only'),false);
  } finally { await rm(root,{recursive:true,force:true}); }
});
