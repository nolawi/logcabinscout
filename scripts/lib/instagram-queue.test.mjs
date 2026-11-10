import test from 'node:test';
import assert from 'node:assert/strict';
import {selectQueuePosts,verifyQueueSource,publishQueueBatch,sourceVerification,validateSourceVerification} from './instagram-queue.mjs';
const photo = id => `https://photos.zillowstatic.com/fp/${id}-o_a.jpg`;
const post = (id='one') => ({id,listing:{id:`zillow:${id}`,price:100000,acreage:2,bedrooms:2,bathrooms:1,squareFeet:900},slides:['cover','exterior','land','interior'].map((role,i)=>({role,sourceUrl:photo(`abc${i}`),imageUrl:`https://example.com/${i}.jpg`}))});
const source = p => ({listing:p.listing,photos:p.slides.map(x=>x.sourceUrl)});
test('selection rejects missing, repeated and already claimed properties before publishing',()=>{
 const queue={posts:[post(),post('two')]};
 assert.equal(selectQueuePosts(queue,{posts:[]},['one','two']).length,2);
 for(const ids of [[],['missing'],['one','one'],['one','two','three','four']])assert.throws(()=>selectQueuePosts(queue,{posts:[]},ids));
 for(const state of ['published','publishing','needs-review'])assert.throws(()=>selectQueuePosts(queue,{posts:[{listingId:'zillow:one',state}]},['one']),/reconciliation/);
});
test('four slides must follow the approved exterior-heavy format',()=>{
 const p=post();p.slides[2].role='interior';assert.throws(()=>selectQueuePosts({posts:[p]},{posts:[]},['one']),/slide order/);
});
test('changed source facts or missing selected photos block stale packages',()=>{
 const p=post();assert.equal(verifyQueueSource(p,source(p)),true);
 for(const key of ['price','acreage','bedrooms','bathrooms','squareFeet'])assert.throws(()=>verifyQueueSource(p,{...source(p),listing:{...p.listing,[key]:999}}),/changed/);
 assert.throws(()=>verifyQueueSource(p,{...source(p),photos:[photo('different')]}),/photos changed/);
 assert.throws(()=>verifyQueueSource(p,{...source(p),listing:{...p.listing,id:'other'}}),/identity/);
});
test('photo resolution changes are allowed when actual photo identity is unchanged',()=>{
 const p=post();assert.equal(verifyQueueSource(p,{...source(p),photos:p.slides.map(x=>x.sourceUrl.replace('-o_a','-uncropped_scaled_within_1536_1152'))}),true);
});
test('claims are durable before publishing and receipts are saved before the next post',async()=>{
 const history={posts:[]};const events=[];
 const result=await publishQueueBatch({posts:[post(),post('two')],history,now:()=> '2026-11-10T00:00:00Z',persist:async h=>events.push(h.posts.at(-1).state),publish:async p=>{events.push('api:'+p.id);return {published:true,mediaId:p.id==='one'?'101':'102',imageCount:4};}});
 assert.deepEqual(events,['publishing','api:one','published','publishing','api:two','published']);assert.equal(result.length,2);assert.equal(history.posts[1].mediaId,'102');
});
test('a failed claim persistence prevents any post',async()=>{
 let called=false;await assert.rejects(publishQueueBatch({posts:[post()],history:{posts:[]},persist:async()=>{throw new Error('write failed');},publish:async()=>{called=true;}}),/write failed/);assert.equal(called,false);
});
test('ambiguous publishing errors retain a blocking history entry and stop the batch',async()=>{
 const history={posts:[]};let calls=0;
 await assert.rejects(publishQueueBatch({posts:[post(),post('two')],history,persist:async()=>{},publish:async()=>{calls++;throw new Error('ambiguous');}}),/ambiguous/);
 assert.equal(calls,1);assert.equal(history.posts[0].state,'needs-review');assert.throws(()=>selectQueuePosts({posts:[post()]},history,['one']),/reconciliation/);
});
test('receipt persistence failure never repeats the publish request',async()=>{
 let writes=0,calls=0;
 await assert.rejects(publishQueueBatch({posts:[post(),post('two')],history:{posts:[]},persist:async()=>{if(++writes===2)throw new Error('push failed');},publish:async()=>{calls++;return {published:true,mediaId:'123'};}}),/push failed/);assert.equal(calls,1);
});

test('source checks are bound to exact packages and must be recent',()=>{
 const posts=[post()];const now=Date.parse('2026-11-10T12:00:00Z');const v=sourceVerification(posts,new Date(now));
 assert.equal(validateSourceVerification(posts,v.verification_time,v.verification_digest,now),true);
 assert.throws(()=>validateSourceVerification(posts,v.verification_time,v.verification_digest,now+31*60000),/stale/);
 assert.throws(()=>validateSourceVerification(posts,v.verification_time,v.verification_digest,now-3*60000),/stale/);
 assert.throws(()=>validateSourceVerification([post('two')],v.verification_time,v.verification_digest,now),/match/);
 assert.throws(()=>validateSourceVerification(posts,'',v.verification_digest,now),/stale/);
});
