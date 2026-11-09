import test from 'node:test';
import assert from 'node:assert/strict';
import { checkMetaConnection, INSTAGRAM_ACCOUNT_ID } from './meta-connection.mjs';
const identity = { id: INSTAGRAM_ACCOUNT_ID, username: 'logcabinscout' };
const ok = body => ({ ok: true, json: async () => body });

test('missing secret stops before contacting Meta', async () => {
  await assert.rejects(checkMetaConnection('', () => assert.fail('unexpected request')), /missing/);
});
test('checks target account using a private header without making a publishing request', async () => {
  const result = await checkMetaConnection('private-test-token', async (url, options) => {
    assert.equal(url, `https://graph.instagram.com/v27.0/${INSTAGRAM_ACCOUNT_ID}?fields=id,username`);
    assert.equal(options.headers.Authorization, 'Bearer private-test-token');
    assert.equal(options.redirect, 'error');
    assert.equal(options.method, undefined);
    return ok(identity);
  });
  assert.match(result, /Read access verified/);
  assert.match(result, /posting have not been tested/);
});
test('tries Facebook Graph for a token from the other login flow', async () => {
  const urls = [];
  await checkMetaConnection('secret', async url => {
    urls.push(url);
    return urls.length === 1 ? { ok: false, status: 400, json: async () => ({ error: { code: 190 } }) } : ok(identity);
  });
  assert.equal(urls.length, 2);
  assert.match(urls[1], /^https:\/\/graph.facebook.com\//);
});
test('errors never echo raw response messages or tokens', async () => {
  await assert.rejects(checkMetaConnection('secret', async () => ({ ok: false, status: 400, json: async () => ({ error: { code: 190, message: 'secret' } }) })), error => error.message.includes('190') && !error.message.includes('secret'));
});
test('wrong account cannot pass', async () => {
  await assert.rejects(checkMetaConnection('secret', async () => ok({ ...identity, id: '123' })), /identity not confirmed/);
});
test('accepts an identity wrapped in a data array', async () => {
  assert.match(await checkMetaConnection('secret', async () => ok({ data: [identity] })), /Connected/);
});
test('unreadable response fails without logging its contents', async () => {
  await assert.rejects(checkMetaConnection('secret', async () => { throw new Error('secret'); }), error => !error.message.includes('secret'));
});
