export const INSTAGRAM_ACCOUNT_ID = '17841480907650824';
const EXPECTED_USERNAME = 'logcabinscout';

export async function checkMetaConnection(token, request = fetch) {
  if (!token?.trim()) throw new Error('INSTAGRAM_ACCESS_TOKEN is missing. Save it in repository Actions secrets.');
  const failures = [];
  for (const host of ['graph.instagram.com', 'graph.facebook.com']) {
    try {
      const response = await request(`https://${host}/v27.0/${INSTAGRAM_ACCOUNT_ID}?fields=id,username`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
        redirect: 'error',
        signal: AbortSignal.timeout(20000),
      });
      const body = await response.json();
      if (!response.ok || body.error) {
        const code = Number(body.error?.code);
        failures.push(`${host}: HTTP ${response.status}, code ${Number.isFinite(code) ? code : 'unknown'}`);
        continue;
      }
      const account = body.id ? body : body.data?.[0];
      if (String(account?.id ?? account?.user_id) !== INSTAGRAM_ACCOUNT_ID || account?.username !== EXPECTED_USERNAME) {
        failures.push(`${host}: target account identity not confirmed`);
        continue;
      }
      return `Connected to @${EXPECTED_USERNAME} (${INSTAGRAM_ACCOUNT_ID}) through ${host}. Read access verified; publishing permission and posting have not been tested.`;
    } catch {
      failures.push(`${host}: request failed or response was unreadable`);
    }
  }
  throw new Error(`Instagram account access could not be verified. ${failures.join('; ')}. No token or raw response was logged.`);
}
