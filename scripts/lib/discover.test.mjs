import test from 'node:test';
import assert from 'node:assert/strict';
import { createRentCastClient, selectListings, discover, MAX_REQUESTS } from './discover.mjs';
const date = new Date('2026-11-07T12:00:00Z');
const listings = Array.from({length:100}, (_,i)=>({id:`id-${i}`,formattedAddress:`${i} Test Road, VA`,price:200000}));

test('weekly selection is bounded, deterministic, independent of provider order, and varies by week',()=>{
  const sample=selectListings(listings,'VA',date);
  assert.equal(sample.length,3);
  assert.deepEqual(sample,selectListings([...listings].reverse(),'VA',date));
  assert.notDeepEqual(sample,selectListings(listings,'VA',new Date('2026-11-14T12:00:00Z')));
});
test('invalid and duplicate addresses never waste enrichment calls',()=>{
  const input=[null,{}, {formattedAddress:' '},{formattedAddress:'  1 Main Street  '},{formattedAddress:'1  MAIN STREET'}, {formattedAddress:'2 Other Road'}];
  assert.equal(selectListings(input,'VA',date).length,2);
});
test('failed requests consume budget and never trigger retries',async()=>{
  let calls=0;
  const client=createRentCastClient('test-key',async()=>{calls++;return {ok:false,status:429};});
  for(let i=0;i<MAX_REQUESTS;i++) await assert.rejects(client.request('/v1/properties',{}),/HTTP 429/);
  await assert.rejects(client.request('/v1/properties',{}),/limit reached/);
  assert.equal(calls,4);assert.equal(client.attempts,4);
});
test('concurrent calls cannot exceed the budget',async()=>{
  let calls=0;
  const client=createRentCastClient('test-key',async()=>{calls++;return {ok:true,json:async()=>[]};});
  const results=await Promise.allSettled(Array.from({length:8},()=>client.request('/v1/properties',{})));
  assert.equal(calls,4);assert.equal(results.filter(item=>item.status==='rejected').length,4);
});
test('discovery makes one search and three lookups and keeps strong matches review-only',async()=>{
  const calls=[];
  const client=createRentCastClient('test-key',async(url,options)=>{
    calls.push(url);
    assert.equal(options.headers['X-Api-Key'],'test-key');
    return {ok:true,json:async()=>url.pathname.endsWith('/sale')?listings:[{features:{exteriorType:'Log'}}]};
  });
  const output=await discover('VA',client,date);
  assert.equal(calls.length,4);
  assert.equal(calls[0].searchParams.get('daysOld'),'7');
  assert.equal(output.summary.apiRequestsAttempted,4);
  assert.equal(output.candidates.length,3);
  assert.ok(output.candidates.every(item=>item.verified===false && item.status==='needs-review'));
  assert.equal(output.summary.published,0);
});
test('empty searches do not spend enrichment requests and malformed responses fail',async()=>{
  const client=createRentCastClient('test-key',async()=>({ok:true,json:async()=>[]}));
  const result=await discover('AK',client,date);
  assert.deepEqual(result.candidates,[]);assert.equal(client.attempts,1);
  const bad=createRentCastClient('test-key',async()=>({ok:true,json:async()=>({unexpected:true})}));
  await assert.rejects(discover('VA',bad,date),/response shape/);
});
