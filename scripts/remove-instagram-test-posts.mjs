// Explicitly authorized cleanup of the two posts created in this session.
const accountId = '17841480907650824';
const targets = ['18119996147019873', '18648829204055220'];
const token = process.env.INSTAGRAM_ACCESS_TOKEN;
if (!token) throw new Error('Missing Instagram token.');
async function api(path, method = 'GET') {
  const response = await fetch(`https://graph.facebook.com/v27.0/${path}`, {
    method, headers: { Authorization: `Bearer ${token}` },
    redirect: 'error', signal: AbortSignal.timeout(25000),
  });
  const body = await response.json();
  if (!response.ok || body.error) {
    const code = Number(body.error?.code);
    throw new Error(`Meta cleanup request failed: HTTP ${response.status}, code ${Number.isFinite(code) ? code : 'unknown'}. Deletion may require instagram_manage_contents and a Facebook User token.`);
  }
  return body;
}
try {
  const account = await api(`${accountId}?fields=id,username`);
  if (String(account.id) !== accountId || account.username !== 'logcabinscout') throw new Error('Account mismatch.');
  const media = await api(`${accountId}/media?fields=id&limit=100`);
  const owned = new Set((media.data ?? []).map(item => String(item.id)));
  for (const id of targets) {
    if (!owned.has(id)) { console.log(`Test post ${id} was not in the account media list; skipped.`); continue; }
    const result = await api(id, 'DELETE');
    if (result.success !== true) throw new Error('Deletion was not confirmed.');
    console.log(`Deleted test post ${id}.`);
  }
} catch (error) {
  console.error(error instanceof TypeError ? 'Meta cleanup request failed; no raw response logged.' : error.message);
  process.exitCode = 1;
}
