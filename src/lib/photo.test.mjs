import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePhoto } from './photo.mjs';
import { buildFeed } from '../../scripts/lib/build-feed.mjs';
import { parseListings } from './listings.ts';
const photo = {
  url: 'https://example.com/original.jpg', alt: 'Front exterior of the listed cabin',
  credit: 'Example Photographer', sourceUrl: 'https://example.com/listing',
  width: 1800, height: 1200, allowCropping: true,
  permission: { status: 'granted', rightsHolder: 'Example Photographer', record: 'Private permission record #123', allowsDerivatives: true },
  variants: [{ url: '/images/properties/example-960.webp', width: 960 }, { url: '/images/properties/example-480.webp', width: 480 }],
};
test('requires complete photo metadata without claiming a usage license', () => {
  for (const patch of [{credit:''}, {alt:''}, {sourceUrl:'javascript:alert(1)'}, {url:'http://example.com/a.jpg'}, {width:0}, {height:Infinity}]) {
    assert.equal(parsePhoto({...photo, ...patch}), undefined);
  }
  const result = parsePhoto(photo);
  assert.equal(result.permission, undefined);
});
test('sorts safe responsive variants and removes duplicate widths and unsafe paths', () => {
  const result = parsePhoto({...photo, variants:[...photo.variants, ...photo.variants, {url:'/images/properties/../private.jpg',width:1440}, {url:'javascript:alert(1)',width:2000}]});
  assert.deepEqual(result.variants.map(item=>item.width), [480,960]);
  assert.equal(result.permission, undefined);
  assert.equal(JSON.stringify(result).includes('Private permission'), false);
});
test('defaults to original framing unless cropping is explicitly selected', () => {
  assert.equal(parsePhoto({...photo, allowCropping: undefined}).allowCropping, false);
});
test('credited photos survive generation and browser parsing; incomplete photos leave listing intact', () => {
  const row={id:'test:1',title:'Log home',location:'Mineral, Virginia',price:250000,listingUrl:'https://example.com/listing',status:'active',verified:true,lastCheckedAt:'2026-11-07T12:00:00Z',photo};
  const [parsed] = parseListings(buildFeed([row]), Date.parse('2026-11-08T12:00:00Z'));
  assert.equal(parsed.photo.credit, photo.credit);
  const [noPhoto] = parseListings(buildFeed([{...row,photo:{...photo,credit:''}}]), Date.parse('2026-11-08T12:00:00Z'));
  assert.equal(noPhoto.photo, undefined);
  assert.equal(noPhoto.id,row.id);
});
test('invalid display metadata never reaches images or attribution links', () => {
  assert.equal(parsePhoto({url:'https://example.com/a.jpg'}),undefined);
  assert.equal(parsePhoto({...photo,sourceUrl:'https://user:password@example.com'}),undefined);
});
