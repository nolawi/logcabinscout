import test from 'node:test';
import assert from 'node:assert/strict';
import {pageData,searchState,searchCandidates,cabinEvidence,listingCandidate,squareFeetFrom,listingGallery} from './public-listings.mjs';
const url='https://www.zillow.com/homedetails/1-Example-Road/123_zpid/';
const wrap=data=>`<script id="__NEXT_DATA__" type="application/json">${JSON.stringify(data).replace(/</g,'\\u003c')}</script>`;
function html(patch={}) {
 const property={zpid:123,description:'An authentic log cabin surrounded by trees.',homeType:'SINGLE_FAMILY',homeStatus:'FOR_SALE',price:300000,address:{streetAddress:'1 Example Road',city:'Example',state:'NC'},bedrooms:3,bathrooms:2.5,resoFacts:{lotSize:'2.50 Acres'},...patch};
 return '<meta name="description" content="Three beds, 2.5 baths, 1,250 sqft home">'+wrap({props:{pageProps:{componentProps:{gdpClientCache:JSON.stringify({query:{property}})}}}});
}
test('source-backed candidates retain useful details and never self-approve',()=>{
 const row=listingCandidate(html(),url);
 assert.equal(row.bedrooms,3);assert.equal(row.bathrooms,2.5);assert.equal(row.squareFeet,1250);assert.equal(row.acreage,2.5);
 assert.equal(row.verified,false);assert.equal(row.status,'needs-review');assert.equal(row.listingUrl,url);
});
test('road names, siding, negation, and accessory-only cabins are not construction evidence',()=>{
 for(const text of ['Bring your vision to 2126 Log Cabin Road in York!','Not a log cabin, but a modern home.','New log siding makes this cabin inviting.','A detached log cabin serves as guest storage.']) assert.deepEqual(cabinEvidence(text),[]);
 assert.equal(listingCandidate(html({description:'A modern home on Log Cabin Road.'}),url),null);
});
test('primary log evidence is retained separately from accessory sentences',()=>{
 assert.equal(cabinEvidence('A true log home on three acres. A detached guest shed has storage.').length,1);
});
test('inactive, contingent, and non-house listings are rejected despite matching words',()=>{
 assert.equal(listingCandidate(html({homeStatus:'SOLD'}),url),null);
 assert.equal(listingCandidate(html({attributionInfo:{trueStatus:'Active Under Contract'}}),url),null);
 assert.equal(listingCandidate(html({homeType:'LOT'}),url),null);
});
test('unknown source layouts and mismatched properties fail rather than inventing data',()=>{
 assert.throws(()=>pageData('<html>blocked</html>'),/Unsupported/);
 assert.throws(()=>listingCandidate(html({zpid:999}),url),/Unsupported/);
 assert.throws(()=>listingCandidate(html(),'https://other.example/123_zpid/'),/Unsupported/);
 assert.equal(squareFeetFrom({livingArea:100,livingAreaUnits:'Square Meters'},''),null);
});
test('search discovery uses real region data and skips known, duplicate, and unrelated results',()=>{
 const row={zpid:123,detailUrl:url,hdpData:{homeInfo:{state:'NC',homeStatus:'FOR_SALE',homeType:'SINGLE_FAMILY'}}};
 const search=wrap({props:{pageProps:{searchPageState:{queryState:{regionSelection:[{regionId:36,regionType:2}],filterState:{}},cat1:{searchResults:{listResults:[row,row,{...row,zpid:999,hdpData:{homeInfo:{state:'PA'}}}]}}}}}});
 assert.equal(searchState(search).filterState.keywords.value,'log cabin');
 assert.equal(searchCandidates(search,'NC').length,1);
 assert.equal(searchCandidates(search,'NC',new Set(['zillow:123'])).length,0);
});

test('gallery chooses one JPEG resolution per source photo and rejects inactive or unsafe galleries',()=>{
 const originals=Array.from({length:4},(_,i)=>({mixedSources:{jpeg:[{width:320,url:`https://photos.zillowstatic.com/fp/abc${i}-small.jpg`},{width:1536,url:`https://photos.zillowstatic.com/fp/abc${i}-large.jpg`}]}}));
 const source=listingGallery(html({originalPhotos:originals}),url);
 assert.equal(source.photos.length,4);assert.ok(source.photos.every(x=>x.endsWith('-large.jpg')));
 assert.throws(()=>listingGallery(html({originalPhotos:originals,homeStatus:'SOLD'}),url),/eligible/);
 assert.throws(()=>listingGallery(html({originalPhotos:originals.map(()=>({mixedSources:{jpeg:[{width:9999,url:'http://127.0.0.1/private'}]}}))}),url),/four usable/);
});
