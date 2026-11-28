import test from'node:test';import assert from'node:assert/strict';
import{statusFromPage,applyStatusResults}from'./listing-status.mjs';
const row={id:'zillow:123',listingUrl:'https://www.zillow.com/homedetails/1-Cabin-Rd/123_zpid/',status:'active',lastCheckedAt:'2026-01-01T00:00:00Z',price:100000};
const page=(homeStatus,trueStatus,zpid=123)=>`<script id="__NEXT_DATA__">${JSON.stringify({props:{pageProps:{componentProps:{gdpClientCache:JSON.stringify({property:{zpid,homeStatus,attributionInfo:{trueStatus}}})}}}})}</script>`;
test('explicit source states map to distinct sale statuses',()=>{
 for(const[h,t,status]of[['FOR_SALE','Active','active'],['FOR_SALE','Active Under Contract','pending'],['PENDING',null,'pending'],['RECENTLY_SOLD','Sold','sold'],['OFF_MARKET',null,'off_market'],['OFF_MARKET','Withdrawn','off_market']]){
  const r=statusFromPage(page(h,t),row);assert.equal(r.status,status);assert.equal(r.sourceUrl,row.listingUrl);assert.ok(r.evidence);
 }
});
test('missing identities, unreadable pages, unsupported sources and conflicting states remain unknown',()=>{
 for(const[html,item]of[[page('FOR_SALE','Sold'),row],[page('FOR_SALE','Mystery'),row],[page('FOR_RENT','Active'),row],[page('SOLD','Active'),row],[page('FOR_SALE','Active',999),row],['404 page',row],[page('FOR_SALE','Active'),{...row,id:'zillow:999'}],[page('FOR_SALE','Active'),{...row,listingUrl:'https://example.com/123'}]])assert.equal(statusFromPage(html,item).status,'unknown');
});
const checkedAt='2026-11-28T12:00:00.000Z';const result={id:row.id,status:'sold',sourceUrl:row.listingUrl,evidence:'homeStatus=RECENTLY_SOLD; trueStatus=Sold',checkedAt};
test('confirmed changes retain dates/facts, record evidence, and are idempotent',()=>{
 const first=applyStatusResults([row],undefined,[result]);const r=first.reviewed[0];assert.equal(r.saleStatus,'sold');assert.equal(r.status,'sold');assert.equal(r.lastCheckedAt,row.lastCheckedAt);assert.equal(r.price,row.price);assert.equal(r.statusCheckedAt,checkedAt);assert.equal(first.history.changes.length,1);assert.equal(row.status,'active');
 const second=applyStatusResults(first.reviewed,first.history,[result]);assert.deepEqual(second,first);
 const later=applyStatusResults(first.reviewed,first.history,[{...result,checkedAt:'2026-11-29T12:00:00.000Z'}]);assert.equal(later.history.changes.length,1);assert.equal(later.history.attempts.length,2);
});
test('unconfirmed attempts preserve a previously confirmed sale instead of marking unavailable sources sold',()=>{
 const first=applyStatusResults([row],undefined,[result]);const failed=applyStatusResults(first.reviewed,first.history,[{id:row.id,status:'unknown',reason:'Source unavailable',checkedAt:'2026-11-29T12:00:00.000Z'}]);assert.equal(failed.reviewed[0].saleStatus,'sold');assert.equal(failed.reviewed[0].statusCheckedAt,checkedAt);assert.equal(failed.reviewed[0].statusCheckOutcome,'unconfirmed');assert.equal(failed.history.changes.length,1);
 const missing=applyStatusResults([row],undefined,[{...result,evidence:undefined}]);assert.equal(missing.reviewed[0].saleStatus,undefined);assert.equal(missing.history.changes.length,0);
});
test('stale results and mismatched evidence cannot overwrite confirmed records',()=>{
 const first=applyStatusResults([row],undefined,[result]);assert.deepEqual(applyStatusResults(first.reviewed,first.history,[{...result,status:'active',checkedAt:'2026-11-27T12:00:00.000Z'}]),first);
 const mismatch=applyStatusResults([row],undefined,[{...result,sourceUrl:'https://example.com/other'}]);assert.equal(mismatch.history.changes.length,0);
 assert.throws(()=>applyStatusResults([row],undefined,[{...result,id:'missing'}]),/unknown listing/);
});

test('CLI previews, applies a bounded batch, retains sold homes, and skips recent checks without network',async()=>{
 const{mkdtemp,mkdir,cp,writeFile,readFile,rm}=await import('node:fs/promises');const{tmpdir}=await import('node:os');const{join}=await import('node:path');const{spawnSync}=await import('node:child_process');
 const root=await mkdtemp(join(tmpdir(),'listing-status-'));
 try{
  await cp(new URL('../',import.meta.url),join(root,'scripts'),{recursive:true});await mkdir(join(root,'src/lib'),{recursive:true});
  for(const file of ['photo.mjs','listing-lifecycle.mjs'])await cp(new URL('../../src/lib/'+file,import.meta.url),join(root,'src/lib',file));
  for(const dir of ['data','public','bin'])await mkdir(join(root,dir));
  const rows=[123,456,789].map(id=>({...row,id:`zillow:${id}`,title:'Cabin '+id,location:'Place, Virginia',verified:true,listingUrl:`https://www.zillow.com/homedetails/Cabin/${id}_zpid/`}));
  const original=JSON.stringify(rows);await writeFile(join(root,'data/reviewed-listings.json'),original);await writeFile(join(root,'public/listings.json'),'[]');
  await writeFile(join(root,'bin/curl'),`#!/usr/bin/env node\nconst u=process.argv.at(-1);if(u.includes('/789_'))process.exit(22);const id=u.includes('/456_')?456:123;process.stdout.write('<script id="__NEXT_DATA__">'+JSON.stringify({props:{pageProps:{componentProps:{gdpClientCache:JSON.stringify({property:{zpid:id,homeStatus:id===456?'RECENTLY_SOLD':'FOR_SALE',attributionInfo:{trueStatus:id===456?'Sold':'Active'}}})}}}})+'</script>');`,{mode:0o755});
  const run=args=>spawnSync(process.execPath,[join(root,'scripts/check-listing-status.mjs'),...args],{cwd:root,env:{...process.env,PATH:join(root,'bin')+':'+process.env.PATH},encoding:'utf8'});
  const preview=run(['--limit','3']);assert.equal(preview.status,0,preview.stderr);assert.equal(JSON.parse(preview.stdout).changes.length,1);assert.equal(await readFile(join(root,'data/reviewed-listings.json'),'utf8'),original);
  const applied=run(['--apply','--limit','3']);assert.equal(applied.status,0,applied.stderr);const report=JSON.parse(applied.stdout);assert.equal(report.confirmed,2);assert.equal(report.unconfirmed,1);
  const saved=JSON.parse(await readFile(join(root,'data/reviewed-listings.json'),'utf8'));assert.equal(saved[1].saleStatus,'sold');assert.equal(saved[2].status,'active');assert.ok(saved.every(r=>r.lastCheckedAt===row.lastCheckedAt&&r.price===row.price));const feed=JSON.parse(await readFile(join(root,'public/listings.json'),'utf8'));assert.equal(feed.length,3);assert.equal(feed[1].saleStatus,'sold');
  const due=run(['--limit','3']);assert.equal(due.status,0,due.stderr);assert.equal(JSON.parse(due.stdout).checked,0);assert.equal(JSON.parse(due.stdout).sourceRequests,0);
  assert.notEqual(run(['--id','missing']).status,0);assert.notEqual(run(['--limit','0']).status,0);
  const savedBeforeFailure=await readFile(join(root,'data/reviewed-listings.json'),'utf8');
  await rm(join(root,'public/listings.json'));await mkdir(join(root,'public/listings.json'));
  assert.notEqual(run(['--apply','--id','zillow:123']).status,0);
  assert.equal(await readFile(join(root,'data/reviewed-listings.json'),'utf8'),savedBeforeFailure);
  await writeFile(join(root,'artifacts/review.lock'),'busy');assert.notEqual(run(['--apply']).status,0);
 }finally{await rm(root,{recursive:true,force:true});}
});
