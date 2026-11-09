import { appendFileSync } from 'node:fs';
import { checkMetaConnection } from './lib/meta-connection.mjs';

try {
  const result = await checkMetaConnection(process.env.INSTAGRAM_ACCESS_TOKEN);
  console.log(result);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${result}\n`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
