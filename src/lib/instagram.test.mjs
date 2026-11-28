import test from 'node:test';
import assert from 'node:assert/strict';
import { publishedInstagramLinks, withInstagramLinks } from './instagram.ts';
const published = { listingId:'zillow:1', state:'published', permalink:'https://www.instagram.com/p/Verified_123-/' };

test('only published entries with verified, safe Instagram post permalinks are exposed', () => {
 const invalid = [null, {}, {...published,state:'publishing'}, {...published,state:'needs-review'}, {...published,listingId:''}, {...published,permalink:undefined},
  ...['javascript:alert(1)','http://www.instagram.com/p/abc/','https://www.instagram.com.evil.com/p/abc/','https://www.instagram.com/user/','https://user@www.instagram.com/p/abc/','https://www.instagram.com/p/abc/?redirect=bad','https://www.instagram.com/p/abc/#bad'].map(permalink=>({...published,permalink}))];
 assert.equal(publishedInstagramLinks({posts:invalid}).size,0);
 for (const input of [null,[],{}, {posts:null}]) assert.equal(publishedInstagramLinks(input).size,0);
 assert.equal(publishedInstagramLinks({posts:[published]}).get('zillow:1'),published.permalink);
});

test('joins exact property IDs without adding stale or unmatched history-only homes', () => {
 const listings=[{id:'zillow:1',title:'Matched'},{id:'zillow:2',title:'Other'}];
 const copy=structuredClone(listings);
 const joined=withInstagramLinks(listings,publishedInstagramLinks({posts:[published,{...published,listingId:'zillow:expired'}]}));
 assert.equal(joined.length,2);assert.equal(joined[0].instagramUrl,published.permalink);assert.equal(joined[1].instagramUrl,undefined);
 assert.deepEqual(listings,copy);
 assert.deepEqual(joined.filter(item=>item.instagramUrl).map(item=>item.id),['zillow:1']);
});

test('later confirmed history replaces earlier links without unconfirmed entries overwriting it', () => {
 const latest={...published,permalink:'https://instagram.com/reel/Latest/'};
 const links=publishedInstagramLinks({posts:[published,latest,{...published,state:'needs-review'}]});
 assert.equal(links.get('zillow:1'),latest.permalink);
});
