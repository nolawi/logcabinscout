import test from 'node:test';
import assert from 'node:assert/strict';
import { checkMetaConnection } from './meta-connection.mjs';

test('missing secret stops before contacting Meta', async () => {
  await assert.rejects(checkMetaConnection('', () => assert.fail('unexpected request')), /missing/);
});
test('checks only identity and permissions using a private authorization header', async () => {
  const paths = [];
  const result = await checkMetaConnection('private-test-token', async (url, options) => {
    paths.push(url);
    assert.equal(options.headers.Authorization, 'Bearer private-test-token');
    assert.equal(options.redirect, 'error');
    assert.ok(!url.includes('private-test-token'));
    return { ok: true, json: async () => paths.length === 1 ? { id: '123' } : { data: ['instagram_basic', 'instagram_content_publish'].map(permission => ({ permission, status: 'granted' })) } };
  });
  assert.equal(paths.length, 2);
  assert.match(result, /posting have not been tested/);
});
test('provider errors never echo response messages or tokens', async () => {
  await assert.rejects(checkMetaConnection('secret', async () => ({ ok: false, status: 400, json: async () => ({ error: { code: 190, message: 'secret' } }) })), error => error.message.includes('190') && !error.message.includes('secret'));
});
test('missing publishing permission fails', async () => {
  let calls = 0;
  await assert.rejects(checkMetaConnection('secret', async () => ({ ok: true, json: async () => ++calls === 1 ? { id: '123' } : { data: [] } })), /instagram_content_publish/);
});
test('accepts an identity wrapped in a data array', async () => {
  let calls = 0;
  const result = await checkMetaConnection('secret', async () => ({ ok: true, json: async () => ++calls === 1 ? { data: [{ user_id: '123' }] } : { data: ['instagram_basic', 'instagram_content_publish'].map(permission => ({ permission, status: 'granted' })) } }));
  assert.match(result, /verified/);
});
test('empty identity data fails without logging response contents', async () => {
  await assert.rejects(checkMetaConnection('secret', async () => ({ ok: true, json: async () => ({ data: [], sensitive: 'secret' }) })), /data array with 0 entries/);
});
