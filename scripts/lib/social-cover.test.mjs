import test from 'node:test';
import assert from 'node:assert/strict';
import { renderInstagramCover } from './social-cover.mjs';
const input = { location: 'Livermore, CO', price: 378000, photoData: 'data:image/jpeg;base64,/9j/AAAA' };
test('cover preserves embedded photo and renders only location and price overlays', () => {
 const html = renderInstagramCover(input);
 assert.ok(html.includes(input.photoData));assert.ok(html.includes('LIVERMORE, CO'));assert.ok(html.includes('$378,000'));
 assert.ok(html.includes('left:50%;top:78%'));assert.ok(html.includes('text-align:center'));assert.ok(html.includes('font-size:80px'));assert.ok(html.includes('font-size:42px'));assert.ok(html.includes('height:auto'));assert.ok(html.includes('color:white'));assert.ok(!html.includes('object-fit:cover'));assert.ok(!html.includes('elancabin'));assert.ok(!html.includes('LOG CABIN SCOUT'));
});
test('location is escaped and invalid prices or remote images are rejected', () => {
 assert.ok(!renderInstagramCover({...input, location:'<script>alert(1)</script>'}).includes('<script>'));
 for (const price of [0,-1,NaN,Infinity]) assert.throws(()=>renderInstagramCover({...input,price}),/price/);
 assert.throws(()=>renderInstagramCover({...input,photoData:'https://example.com/a.jpg'}),/embedded/);
});
