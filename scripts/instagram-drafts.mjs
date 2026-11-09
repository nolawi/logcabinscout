import {execFileSync} from 'node:child_process';
import {readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {parseListings} from '../src/lib/listings.ts';
import {prepareSocialDrafts,renderSocialCard} from './lib/social-drafts.mjs';
const now=new Date();
const sourceFeed='https://elancabin.com/listings.json';
const rows=JSON.parse(execFileSync('curl',['--fail','--silent','--show-error','--max-time','25',sourceFeed],{encoding:'utf8',maxBuffer:5*1024*1024}));
const drafts=prepareSocialDrafts(parseListings(rows,now.getTime()),now);
const logo=await readFile(new URL('../public/logo-mark.svg',import.meta.url),'utf8');

const output=new URL('../artifacts/instagram/',import.meta.url);
await mkdir(output,{recursive:true});
// Remove only this generator's numbered outputs to avoid retaining stale cards on an empty run.
for(let i=1;i<=2;i++)for(const extension of ['html','png','jpg','caption.txt','alt.txt'])await rm(new URL(`draft-${i}.${extension}`,output),{force:true});
for(const [i,draft] of drafts.entries()) {
  const photoUrl=new URL(draft.photo.url);
  if(photoUrl.protocol!=='https:' || photoUrl.username || photoUrl.password) throw new Error('Property photo must use HTTPS without credentials.');
  const image=execFileSync('curl',['--proto','=https','--proto-redir','=https','--location','--fail','--silent','--show-error','--max-time','25','--max-filesize','15000000',photoUrl.href],{maxBuffer:15*1024*1024});
  const mime=image[0]===255&&image[1]===216?'jpeg':image.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'png':image.toString('ascii',0,4)==='RIFF'&&image.toString('ascii',8,12)==='WEBP'?'webp':null;
  if(!mime) throw new Error('Property photo is not a supported image.');
  const photoData=`data:image/${mime};base64,${image.toString('base64')}`;
  await writeFile(new URL(`draft-${i+1}.html`,output),renderSocialCard(draft,logo,photoData));
  await writeFile(new URL(`draft-${i+1}.caption.txt`,output),draft.caption+'\n');
  await writeFile(new URL(`draft-${i+1}.alt.txt`,output),draft.altText+'\n');
}
await writeFile(new URL('manifest.json',output),JSON.stringify({generatedAt:now.toISOString(),sourceFeed,status:'draft-only',published:false,drafts},null,2)+'\n');
console.log(`Prepared ${drafts.length} Instagram drafts. Nothing published. Render PNGs with python scripts/render-social-drafts.py.`);
