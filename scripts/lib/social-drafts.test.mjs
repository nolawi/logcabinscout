import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareSocialDrafts,renderSocialCard,buildInstagramCaption} from './social-drafts.mjs';
const date=new Date('2026-11-09T12:00:00Z');
const row=(id,location)=>({id,title:'1 Cabin Road',location,price:250000,acreage:2,listingUrl:'https://example.com/listing',photo:{url:'https://example.com/property-photo.jpg',credit:'MLS / Listing provider',alt:'Cabin exterior'}});
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
test('cards embed property photos, preserve credit, and omit the temporary domain',()=>{
 const [draft]=prepareSocialDrafts([{...row('1','Place, Colorado'),title:'<script>alert(1)</script>',photo:{...row('1','Place, Colorado').photo,alt:'<script>alert(1)</script>'}}],date);
 const html=renderSocialCard(draft,'<svg></svg>','data:image/jpeg;base64,/9j/AAAA');
 assert.ok(!html.includes('<script>'));assert.ok(html.includes('&lt;script&gt;'));
 assert.ok(html.includes('data:image/jpeg;base64,'));assert.ok(html.includes('height:auto'));assert.ok(!html.includes('<header'));assert.ok(!html.includes('<footer'));assert.ok(!html.includes(draft.facts));
 assert.ok(!html.toLowerCase().includes('elancabin'));assert.ok(!draft.caption.toLowerCase().includes('elancabin'));assert.ok(!draft.caption.includes('link in bio'));assert.ok(!draft.caption.includes('Full listing:'));assert.ok(!draft.caption.includes('Prices and availability'));assert.ok(draft.caption.split('\n').includes(draft.sourceUrl));
 assert.ok(draft.caption.includes('https://example.com/listing'));
 assert.ok(draft.altText.includes('<script>alert(1)</script>'));assert.ok(draft.caption.includes('MLS / Listing provider'));
});

test('photo drafts never substitute illustrations for missing photos',()=>{
 assert.deepEqual(prepareSocialDrafts([{...row('1','Place, Colorado'),photo:null}],date),[]);
 assert.throws(()=>renderSocialCard({},'<svg></svg>'),/photograph/);
});

test('captions put a short headline above the bare URL, five tags before credit, and include known home facts',()=>{
 const caption=buildInstagramCaption({...row('1','Jacksboro, Tennessee'),bedrooms:3,bathrooms:2,squareFeet:2842});
 assert.equal(caption.split('\n')[1],'https://example.com/listing');
 assert.ok(caption.endsWith('Photos: MLS / Listing provider.'));
 assert.equal(caption.match(/#[A-Za-z]+/g).length,5);
 assert.ok(caption.includes('#TennesseeRealEstate'));
 assert.ok(caption.includes('3 beds · 2 baths · 2,842 sq ft'));
 assert.ok(!caption.includes('availability'));assert.ok(!caption.includes('Full listing:'));
});
test('missing room facts are omitted instead of invented',()=>{
 const caption=buildInstagramCaption(row('1','Place, Colorado'));
 assert.ok(!caption.includes('beds'));assert.ok(!caption.includes('sq ft'));assert.ok(!caption.includes('undefined'));
});

test('editorial headlines appear immediately before the URL and reject multiline content',()=>{
 const caption=buildInstagramCaption(row('1','Florence, Montana'),{headline:'Off Grid With Bitterroot Views'});
 assert.equal(caption.split('\n')[0],'Off Grid With Bitterroot Views');
 assert.equal(caption.split('\n')[1],'https://example.com/listing');
 assert.equal(caption.split('\n')[0].split(' ').length,5);
 assert.throws(()=>buildInstagramCaption(row('1','Place, Colorado'),{headline:'One\nTwo'}),/headline/);
});

test('one bedroom and bathroom use singular labels',()=>{
 const caption=buildInstagramCaption({...row('1','Florence, Montana'),bedrooms:1,bathrooms:1});
 assert.ok(caption.includes('1 bed · 1 bath'));assert.ok(!caption.includes('1 beds'));
});

test('material property notes stay above hashtags while credit remains last',()=>{
 const caption=buildInstagramCaption({...row('1','Fairplay, Colorado'),bathrooms:0,socialNotes:'Off-grid; seasonal road access.'},{headline:'Thirty Acres Beyond The Crowds'});
 assert.ok(caption.includes('0 baths'));assert.ok(caption.includes('Off-grid; seasonal road access.'));assert.ok(caption.indexOf('Off-grid;')<caption.indexOf('#LogCabinScout'));assert.ok(caption.endsWith('Photos: MLS / Listing provider.'));
});
