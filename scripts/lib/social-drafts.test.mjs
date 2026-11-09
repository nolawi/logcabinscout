import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareSocialDrafts,renderSocialCard} from './social-drafts.mjs';
const date=new Date('2026-11-09T12:00:00Z');
const row=(id,location)=>({id,title:'1 Cabin Road',location,price:250000,acreage:2,listingUrl:'https://example.com/listing',photo:{url:'https://example.com/property-photo.jpg'}});
test('weekly drafts are deterministic, unique, and prefer different states',()=>{
 const rows=[row('1','Example, Virginia'),row('2','Other, Virginia'),row('3','Place, Colorado')];
 const drafts=prepareSocialDrafts(rows,date);
 assert.equal(drafts.length,2);assert.notEqual(drafts[0].listingId,drafts[1].listingId);
 assert.notEqual(drafts[0].location.split(',').at(-1),drafts[1].location.split(',').at(-1));
 assert.deepEqual(drafts,prepareSocialDrafts([...rows].reverse(),date));
});
test('empty collections create nothing and one listing never creates duplicate posts',()=>{
 assert.deepEqual(prepareSocialDrafts([],date),[]);
 assert.equal(prepareSocialDrafts([row('1','Example, Virginia')],date).length,1);
 assert.deepEqual(prepareSocialDrafts([{...row('1','Example, Virginia'),isSample:true}],date),[]);
});
test('cards escape source text and do not embed property photos or source scripts',()=>{
 const [draft]=prepareSocialDrafts([{...row('1','Place, Colorado'),title:'<script>alert(1)</script>'}],date);
 const html=renderSocialCard(draft,'<svg></svg>');
 assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));
 assert.ok(!html.includes('property-photo.jpg'));
 assert.ok(draft.caption.includes('https://example.com/listing'));
 assert.ok(draft.altText.includes('no property photograph'));
});
