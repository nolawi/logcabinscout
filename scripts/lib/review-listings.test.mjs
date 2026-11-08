import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewChange, candidateQueue } from './review-listings.mjs';
const now = Date.parse('2026-11-08T12:00:00Z');
const candidate = {id:'rentcast:1',address:'1 Cabin Road',city:'Mineral',state:'VA',price:250000,classification:'log-cabin',status:'needs-review',verified:false};
const candidates = {candidates:[candidate]};
const details = {id:'mls:123',listingUrl:'https://example.com/listing',lastCheckedAt:'2026-11-08T10:00:00Z'};
const approve = () => reviewChange([],{action:'approve',id:candidate.id,candidates,details},now);

test('approval publishes a sourced candidate and records its discovery identity',()=>{
  const result = approve();
  assert.equal(result.reviewed[0].discoveryId,candidate.id);
  assert.equal(result.feed[0].id,'mls:123');
  assert.equal(result.feed[0].verified,true);
  assert.equal(candidate.verified,false);
});
test('approval requires an explicit real review date and source URL',()=>{
  for (const patch of [{lastCheckedAt:undefined}, {lastCheckedAt:'2027-01-01T00:00:00Z'}, {listingUrl:'javascript:alert(1)'}, {acreage:-1}, {photo:{url:'https://example.com/image.jpg'}}]) {
    assert.throws(()=>reviewChange([],{action:'approve',id:candidate.id,candidates,details:{...details,...patch}},now));
  }
});
test('history queues deduplicate candidates and recognize already-reviewed custom IDs',()=>{
  const input={version:1,entries:{a:{candidate},b:{candidate},c:{classification:'not-confirmed'}}};
  const queue=candidateQueue(input,approve().reviewed);
  assert.equal(queue.length,1);assert.equal(queue[0].reviewedId,'mls:123');
  assert.throws(()=>reviewChange(approve().reviewed,{action:'approve',id:candidate.id,candidates,details},now),/already reviewed/);
});
test('status changes remove listings without renewing review dates or mutating inputs',()=>{
  const rows=approve().reviewed;
  for (const status of ['sold','pending','off_market']) {
    const result=reviewChange(rows,{action:'status',id:'mls:123',status},now);
    assert.deepEqual(result.feed,[]);
    assert.equal(result.reviewed[0].lastCheckedAt,details.lastCheckedAt);
    assert.equal(rows[0].status,'active');
  }
});
test('updates attach credited photos, allow removal, and reject accidental approval fields',()=>{
  const rows=approve().reviewed;
  const photo={url:'https://example.com/photo.jpg',credit:'Example source',sourceUrl:'https://example.com/listing',alt:'Log cabin exterior',width:960,height:640};
  const result=reviewChange(rows,{action:'update',id:'mls:123',details:{photo,price:240000}},now);
  assert.equal(result.feed[0].photo.credit,photo.credit);
  assert.equal(result.feed[0].price,240000);
  assert.equal(result.reviewed[0].lastCheckedAt,details.lastCheckedAt);
  assert.equal(reviewChange(result.reviewed,{action:'update',id:'mls:123',details:{photo:null}},now).feed[0].photo,undefined);
  assert.throws(()=>reviewChange(rows,{action:'update',id:'mls:123',details:{verified:true}},now),/Unsupported/);
  assert.throws(()=>reviewChange(rows,{action:'status',id:'missing',status:'sold'},now),/not found/);
});

test('CLI previews without writing, writes consistent JSON, and rolls back on feed-write failure',async()=>{
  const {mkdtemp,mkdir,cp,writeFile,readFile,rm}=await import('node:fs/promises');
  const {tmpdir}=await import('node:os');const {join}=await import('node:path');const {spawnSync}=await import('node:child_process');
  const root=await mkdtemp(join(tmpdir(),'listing-review-'));
  try {
    await cp(new URL('../',import.meta.url),join(root,'scripts'),{recursive:true});
    await mkdir(join(root,'src/lib'),{recursive:true});
    await cp(new URL('../../src/lib/photo.mjs',import.meta.url),join(root,'src/lib/photo.mjs'));
    await mkdir(join(root,'data'));await mkdir(join(root,'public'));
    await writeFile(join(root,'data/reviewed-listings.json'),'[]\n');await writeFile(join(root,'public/listings.json'),'[]\n');
    await writeFile(join(root,'candidates.json'),JSON.stringify(candidates));await writeFile(join(root,'details.json'),JSON.stringify({...details,lastCheckedAt:new Date(Date.now()-60000).toISOString()}));
    const run=(args)=>spawnSync(process.execPath,[join(root,'scripts/review-listings.mjs'),...args],{cwd:root,encoding:'utf8'});
    const command=['approve','candidates.json',candidate.id,'details.json'];
    const preview=run(command);assert.equal(preview.status,0,preview.stderr);
    assert.equal(await readFile(join(root,'data/reviewed-listings.json'),'utf8'),'[]\n');
    const saved=run([...command,'--write']);assert.equal(saved.status,0,saved.stderr);
    assert.equal(JSON.parse(await readFile(join(root,'public/listings.json'),'utf8')).length,1);
    assert.notEqual(run([...command,'--write']).status,0);
    const original=await readFile(join(root,'data/reviewed-listings.json'),'utf8');
    await rm(join(root,'public/listings.json'));await mkdir(join(root,'public/listings.json'));
    const failed=run(['status','mls:123','sold','--write']);assert.notEqual(failed.status,0);
    assert.equal(await readFile(join(root,'data/reviewed-listings.json'),'utf8'),original);
    await writeFile(join(root,'artifacts/review.lock'),'fixture');
    assert.notEqual(run(['status','mls:123','sold','--write']).status,0);
  } finally { await rm(root,{recursive:true,force:true}); }
});

test('approval keeps sourced home facts and normalizes state names; invalid edits fail',()=>{
  const sourced={...candidate,bedrooms:2,bathrooms:1.5,squareFeet:1250};
  const result=reviewChange([],{action:'approve',id:sourced.id,candidates:{candidates:[sourced]},details},now);
  assert.equal(result.feed[0].bedrooms,2);assert.equal(result.feed[0].bathrooms,1.5);assert.equal(result.feed[0].squareFeet,1250);
  assert.equal(result.reviewed[0].location,'Mineral, Virginia');
  assert.throws(()=>reviewChange(result.reviewed,{action:'update',id:'mls:123',details:{bedrooms:2.5}},now),/Invalid bedrooms/);
});
