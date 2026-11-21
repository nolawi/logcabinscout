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
test('prepare mode processes the image without publishing a post', async () => {
 const calls=[];
 const result=await publishInstagram({token:'secret',prepare:true,imageUrl:'https://example.com/card.jpg',caption:'test'},fake([identity,quota,{id:'123'},{status_code:'FINISHED'}],calls));
 assert.equal(result.published,false); assert.equal(result.containerId,'123');
 assert.ok(!calls.some(c=>c.url.endsWith('/media_publish')));
});

test('three-photo carousel creates three children then publishes the parent once', async () => {
 const calls=[];
 const result=await publishInstagram({token:'secret',publish:true,imageUrls:['https://example.com/1.jpg','https://example.com/2.jpg','https://example.com/3.jpg'],caption:'Listing'},fake([identity,quota,{id:'101'},{status_code:'FINISHED'},{id:'102'},{status_code:'FINISHED'},{id:'103'},{status_code:'FINISHED'},{id:'200'},{status_code:'FINISHED'},{id:'300'}],calls));
 assert.equal(result.mediaId,'300');
 const writes=calls.filter(c=>c.method==='POST');
 assert.equal(writes.length,5);
 assert.ok(writes.slice(0,3).every(c=>c.body.get('is_carousel_item')==='true'));
 assert.equal(writes[3].body.get('media_type'),'CAROUSEL');assert.equal(writes[3].body.get('children'),'101,102,103');
 assert.equal(writes[4].body.get('creation_id'),'200');
});
test('invalid or duplicate carousel images fail before creating media', async () => {
 for (const imageUrls of [['https://example.com/1.jpg'],['https://example.com/1.jpg','http://example.com/2.jpg'],['https://example.com/1.jpg','https://example.com/1.jpg']]) {
  const calls=[];await assert.rejects(publishInstagram({token:'secret',publish:true,imageUrls,caption:'Listing'},fake([identity,quota],calls)));assert.equal(calls.length,2);
 }
});
test('failed carousel child prevents parent creation and publishing', async () => {
 const calls=[];await assert.rejects(publishInstagram({token:'secret',publish:true,imageUrls:['https://example.com/1.jpg','https://example.com/2.jpg'],caption:'Listing'},fake([identity,quota,{id:'101'},{status_code:'ERROR'}],calls)),/not available/);
 assert.equal(calls.filter(c=>c.method==='POST').length,1);
});

test('published carousel is verified by a read without repeating publishing', async()=>{
 const calls=[];
 const result=await publishInstagram({token:'secret',publish:true,imageUrls:['https://example.com/1.jpg','https://example.com/2.jpg'],caption:'Listing'},fake([identity,quota,{id:'101'},{status_code:'FINISHED'},{id:'102'},{status_code:'FINISHED'},{id:'200'},{status_code:'FINISHED'},{id:'300'},{permalink:'https://www.instagram.com/p/ExamplePost/',media_type:'CAROUSEL_ALBUM',children:{data:[{id:'101'},{id:'102'}]}}],calls));
 assert.equal(result.verifiedImageCount,2);assert.equal(result.permalink,'https://www.instagram.com/p/ExamplePost/');
 assert.equal(calls.filter(c=>c.url.endsWith('/media_publish')).length,1);assert.equal(calls.at(-1).method,'GET');
});

test('ambiguous publish responses reconcile a unique recent carousel without another write',async()=>{
 for(const mode of ['match','missing','duplicate','stale','wrong-count','wrong-caption','read-error']) {
  const calls=[];const item={id:'300',caption:'Listing',timestamp:new Date().toISOString(),permalink:'https://www.instagram.com/p/ExamplePost/',children:{data:[{id:'101'},{id:'102'}]}};
  if(mode==='stale')item.timestamp='2020-01-01T00:00:00Z';
  if(mode==='wrong-count')item.children.data.pop();
  if(mode==='wrong-caption')item.caption='Other';
  const bodies=[identity,quota,{id:'101'},{status_code:'FINISHED'},{id:'102'},{status_code:'FINISHED'},{id:'200'},{status_code:'FINISHED'}];
  const request=async(url,options)=>{
   calls.push({url,...options});
   if(url.endsWith('/media_publish'))return{ok:false,status:403,json:async()=>({error:{code:4}})};
   if(url.includes('/media?')){if(mode==='read-error')throw Error('unavailable');return{ok:true,json:async()=>({data:mode==='missing'?[]:mode==='duplicate'?[item,item]:[item]})}}
   return{ok:true,json:async()=>bodies.shift()};
  };
  const result=publishInstagram({token:'secret',publish:true,imageUrls:['https://example.com/1.jpg','https://example.com/2.jpg'],caption:'Listing'},request);
  if(mode==='match'){const published=await result;assert.equal(published.mediaId,'300');assert.equal(published.verifiedImageCount,2)}
  else await assert.rejects(result,/code 4/);
  assert.equal(calls.filter(c=>c.url.endsWith('/media_publish')).length,1);
  assert.equal(calls.at(-1).method,'GET');
 }
});
