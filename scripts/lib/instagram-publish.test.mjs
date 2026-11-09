import test from 'node:test';
import assert from 'node:assert/strict';
import { publishInstagram } from './instagram-publish.mjs';
import { INSTAGRAM_ACCOUNT_ID } from './meta-connection.mjs';
const identity = { id: INSTAGRAM_ACCOUNT_ID, username: 'logcabinscout' };
const quota = { data: [{ quota_usage: 0, config: { quota_total: 100 } }] };
const fake = (bodies, calls) => async (url, options) => { calls.push({url, ...options}); return {ok:true, json:async()=>bodies.shift()}; };
test('default mode only reads identity and quota', async () => {
 const calls=[]; const result=await publishInstagram({token:'secret'},fake([identity,quota],calls));
 assert.equal(result.published,false); assert.equal(calls.length,2); assert.ok(calls.every(c=>c.method==='GET'));
});
test('publishing waits for readiness and publishes exactly once', async () => {
 const calls=[]; const result=await publishInstagram({token:'secret',publish:true,imageUrl:'https://elancabin.com/card.jpg',caption:'Cabin spotlight'},fake([identity,quota,{id:'123'},{status_code:'IN_PROGRESS'},{status_code:'FINISHED'},{id:'456'}],calls),async()=>{});
 assert.equal(result.mediaId,'456'); assert.equal(calls.filter(c=>c.url.endsWith('/media_publish')).length,1);
 assert.equal(calls[2].body.get('caption'),'Cabin spotlight');
});
test('wrong account or exhausted quota prevents writes', async () => {
 for(const bodies of [[{...identity,username:'wrong'}],[identity,{data:[{quota_usage:100,config:{quota_total:100}}]}]]) {
  const calls=[]; await assert.rejects(publishInstagram({token:'secret',publish:true},fake(bodies,calls))); assert.ok(calls.every(c=>c.method==='GET'));
 }
});
test('invalid image URL prevents container creation', async () => {
 const calls=[]; await assert.rejects(publishInstagram({token:'secret',publish:true,imageUrl:'http://example.com/a.jpg',caption:'test'},fake([identity,quota],calls)),/HTTPS/); assert.equal(calls.length,2);
});
test('failed container prevents publishing', async () => {
 const calls=[]; await assert.rejects(publishInstagram({token:'secret',publish:true,imageUrl:'https://elancabin.com/a.jpg',caption:'test'},fake([identity,quota,{id:'123'},{status_code:'ERROR'}],calls)),/not available/); assert.ok(!calls.some(c=>c.url.endsWith('/media_publish')));
});
