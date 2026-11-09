import { appendFileSync } from 'node:fs';
import { publishInstagram } from './lib/instagram-publish.mjs';
try {
  const result = await publishInstagram({ token: process.env.INSTAGRAM_ACCESS_TOKEN, imageUrl: process.env.IMAGE_URL, caption: process.env.POST_CAPTION, publish: process.env.PUBLISH === 'true', prepare: process.env.PREPARE === 'true' });
  console.log(JSON.stringify(result));
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${result.message}\n${result.mediaId ? `Media ID: ${result.mediaId}\n` : ''}`);
} catch (error) { console.error(error.message); process.exitCode = 1; }
