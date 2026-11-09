export async function checkMetaConnection(token, request = fetch) {
  if (!token?.trim()) throw new Error('INSTAGRAM_ACCESS_TOKEN is missing. Save it in repository Actions secrets.');
  async function get(path) {
    let response;
    try {
      response = await request(`https://graph.facebook.com/v27.0/${path}`, {
        headers: { Authorization: `Bearer ${token}` },
        redirect: 'error',
        signal: AbortSignal.timeout(20000),
      });
    } catch {
      throw new Error('Could not reach Meta. No token details were logged.');
    }
    let body;
    try { body = await response.json(); } catch { throw new Error('Meta returned an unreadable response.'); }
    if (!response.ok || body.error) {
      const code = Number(body.error?.code);
      throw new Error(`Meta rejected the request (HTTP ${response.status}, code ${Number.isFinite(code) ? code : 'unknown'}). Check token validity and app access.`);
    }
    return body;
  }
  const identity = await get('me?fields=id');
  const account = identity.id ? identity : identity.data?.[0];
  if (!account?.id && !account?.user_id) {
    const shape = Array.isArray(identity.data) ? `data array with ${identity.data.length} entries` : 'no identity object';
    throw new Error(`Meta did not return an authenticated identity (${shape}). Account authorization needs investigation.`);
  }
  const permissions = await get('me/permissions');
  const granted = new Set((permissions.data ?? []).filter(p => p.status === 'granted').map(p => p.permission));
  const missing = ['instagram_basic', 'instagram_content_publish'].filter(p => !granted.has(p));
  if (missing.length) throw new Error(`Required Unified Login permissions are missing: ${missing.join(', ')}.`);
  return 'Meta authentication and Instagram publishing permissions verified. Instagram asset access and posting have not been tested.';
}
