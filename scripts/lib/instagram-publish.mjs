import { INSTAGRAM_ACCOUNT_ID } from './meta-connection.mjs';

export async function publishInstagram({ token, imageUrl = '', imageUrls, caption = '', publish = false, prepare = false }, request = fetch, pause = ms => new Promise(resolve => setTimeout(resolve, ms))) {
  if (!token?.trim()) throw new Error('INSTAGRAM_ACCESS_TOKEN is missing.');
  const base = `https://graph.facebook.com/v27.0/${INSTAGRAM_ACCOUNT_ID}`;
  async function api(url, fields) {
    let response, body;
    try {
      response = await request(url, {
        method: fields ? 'POST' : 'GET',
        headers: { Authorization: `Bearer ${token.trim()}` },
        ...(fields ? { body: new URLSearchParams(fields) } : {}),
        redirect: 'error', signal: AbortSignal.timeout(25000),
      });
      body = await response.json();
    } catch { throw new Error('Meta request failed. Do not retry a publishing attempt until account history is checked.'); }
    if (!response.ok || body.error) {
      const code = Number(body.error?.code);
      throw new Error(`Meta rejected the request (HTTP ${response.status}, code ${Number.isFinite(code) ? code : 'unknown'}).`);
    }
    return body;
  }
  const identity = await api(`${base}?fields=id,username`);
  if (String(identity.id) !== INSTAGRAM_ACCOUNT_ID || identity.username !== 'logcabinscout') throw new Error('Target Instagram account did not match.');
  const limit = await api(`${base}/content_publishing_limit?fields=config,quota_usage`);
  const quota = limit.data?.[0];
  if (!Number.isFinite(quota?.quota_usage) || !Number.isFinite(quota?.config?.quota_total)) throw new Error('Meta did not confirm publishing quota access.');
  if (quota.quota_usage >= quota.config.quota_total) throw new Error('Instagram publishing quota is exhausted.');
  if (!publish && !prepare) return { published: false, message: 'Account identity and publishing quota access verified. No media container or post created.' };
  const carousel = imageUrls !== undefined;
  const sources = carousel ? imageUrls : [imageUrl];
  if (!Array.isArray(sources) || (carousel && (sources.length < 2 || sources.length > 10))) throw new Error('A carousel requires 2–10 image URLs.');
  const urls = sources.map(value => {
    let url;
    try { url = new URL(value); } catch { throw new Error('A public HTTPS JPEG image URL is required.'); }
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Use a public HTTPS JPEG image URL without credentials.');
    return url.href;
  });
  if (new Set(urls).size !== urls.length) throw new Error('Carousel image URLs must be distinct.');
  if (!caption.trim() || [...caption].length > 2200) throw new Error('Caption must contain 1–2200 characters.');
  async function waitForContainer(container) {
    if (!/^\d+$/.test(String(container.id))) throw new Error('Meta did not return a media container ID.');
    let ready = false;
    for (let attempt = 0; attempt < 12; attempt++) {
      const status = await api(`https://graph.facebook.com/v27.0/${container.id}?fields=status_code`);
      if (status.status_code === 'FINISHED') { ready = true; break; }
      if (['ERROR', 'EXPIRED', 'PUBLISHED'].includes(status.status_code)) throw new Error('Media container is not available for publishing. Check account history before retrying.');
      await pause(5000);
    }
    if (!ready) throw new Error('Media container is still processing. No publish request was sent.');
  }
  let container;
  if (carousel) {
    const children = [];
    for (const url of urls) {
      const child = await api(`${base}/media`, { image_url: url, is_carousel_item: 'true' });
      await waitForContainer(child);
      children.push(String(child.id));
    }
    container = await api(`${base}/media`, { media_type: 'CAROUSEL', children: children.join(','), caption });
  } else {
    container = await api(`${base}/media`, { image_url: urls[0], caption });
  }
  await waitForContainer(container);
  if (!publish) return { published: false, containerId: String(container.id), message: 'Meta fetched and processed the image successfully. Container ready; no post published.' };
  // Never retry this POST: an ambiguous response could otherwise create duplicates.
  const post = await api(`${base}/media_publish`, { creation_id: String(container.id) });
  if (!/^\d+$/.test(String(post.id))) throw new Error('Publishing response was inconclusive. Check Instagram before retrying.');
  // Verify the result with a read; never repeat the publish POST if this read fails.
  let permalink, verifiedImageCount;
  try {
    const detail = await api(`https://graph.facebook.com/v27.0/${post.id}?fields=permalink,media_type,children{id}`);
    if (/^https:\/\/(www\.)?instagram\.com\/(p|reel)\/[A-Za-z0-9_-]+\/?$/.test(detail.permalink ?? '')) permalink = detail.permalink;
    if (Array.isArray(detail.children?.data)) verifiedImageCount = detail.children.data.length;
  } catch { /* A published post remains successful even if verification is unavailable. */ }
  return { published: true, mediaId: String(post.id), imageCount: urls.length, verifiedImageCount, permalink, message: 'One Instagram post published.' };
}
