import { appendFileSync } from 'node:fs';
import { publishInstagram } from './lib/instagram-publish.mjs';
try {
  const imageUrls = process.env.IMAGE_URLS?.trim() ? JSON.parse(process.env.IMAGE_URLS) : undefined;
  const result = await publishInstagram({ imageUrls, token: process.env.INSTAGRAM_ACCESS_TOKEN, imageUrl: process.env.IMAGE_URL, caption: process.env.POST_CAPTION, publish: process.env.PUBLISH === 'true', prepare: process.env.PREPARE === 'true' });
  console.log(JSON.stringify(result));
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${result.message}\n${result.mediaId ? `Media ID: ${result.mediaId}\n` : ''}`);
} catch (error) { console.error(error instanceof SyntaxError ? 'IMAGE_URLS must be a JSON array of public image URLs.' : error.message); process.exitCode = 1; }
