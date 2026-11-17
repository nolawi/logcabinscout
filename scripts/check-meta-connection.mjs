import { appendFileSync } from 'node:fs';
import { checkMetaConnection, INSTAGRAM_ACCOUNT_ID } from './lib/meta-connection.mjs';

try {
  const result = await checkMetaConnection(process.env.INSTAGRAM_ACCESS_TOKEN);
  console.log(result);
  // Read-only reconciliation after an ambiguous publishing failure.
  const response = await fetch(`https://graph.facebook.com/v27.0/${INSTAGRAM_ACCOUNT_ID}/media?fields=id,caption,permalink,children{id}&limit=10`, {
    headers: { Authorization: `Bearer ${process.env.INSTAGRAM_ACCESS_TOKEN.trim()}` },
    redirect: 'error', signal: AbortSignal.timeout(25000),
  });
  const recent = await response.json();
  if (!response.ok || !Array.isArray(recent.data)) {
    const code = Number(recent.error?.code);
    throw new Error(`Recent Instagram history unavailable (HTTP ${response.status}, code ${Number.isFinite(code) ? code : 'unknown'}). Nothing published.`);
  }
  for (const post of recent.data) console.log(JSON.stringify({ mediaId: post.id, permalink: post.permalink, caption: post.caption, imageCount: post.children?.data?.length }));
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${result}\n`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
