import test from 'node:test';
import assert from 'node:assert/strict';
import { serializeJson, structuredData, SITE_URL } from '../../src/lib/seo.mjs';
test('embedded feed and structured data cannot close their script element',()=>{
  const value={title:'</script><script>alert("x")</script>&'};
  const json=serializeJson(value);
  assert.equal(json.includes('<'),false);
  assert.equal(json.includes('>'),false);
  assert.equal(json.includes('&'),false);
  assert.deepEqual(JSON.parse(json),value);
});
test('collection schema describes real source links without invented local pages or offers',()=>{
  const rows=[{title:'A log cabin',location:'Example, Colorado',listingUrl:'https://example.com/listing'}];
  const graph=structuredData(rows)['@graph'];
  assert.equal(graph[0]['@type'],'WebSite');
  assert.equal(graph[1].url,SITE_URL);
  assert.equal(graph[1].mainEntity.numberOfItems,1);
  assert.equal(graph[1].mainEntity.itemListElement[0].url,rows[0].listingUrl);
  assert.equal(JSON.stringify(graph).includes('Offer'),false);
});
test('empty collections produce truthful zero-item structured data',()=>{
  const list=structuredData([])['@graph'][1].mainEntity;
  assert.equal(list.numberOfItems,0);
  assert.deepEqual(list.itemListElement,[]);
});
