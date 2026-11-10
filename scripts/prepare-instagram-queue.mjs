import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {listingGallery} from './lib/public-listings.mjs';
import {renderInstagramCover} from './lib/social-cover.mjs';
import {buildInstagramCaption} from './lib/social-drafts.mjs';
const plans=JSON.parse(await readFile('data/instagram-plan.json','utf8')).posts;
const reviewed=JSON.parse(await readFile('public/listings.json','utf8'));
const history=JSON.parse(await readFile('data/instagram-post-history.json','utf8'));
const requested=process.argv.slice(2);
if(requested.some(id=>!plans.some(p=>p.id===id)))throw new Error('Unknown queue ID.');
let previous;
try { previous=JSON.parse(await readFile('data/instagram-queue.json','utf8')); } catch(error) { if(error.code!=='ENOENT')throw error;previous={version:1,posts:[]}; }
await mkdir('public/social/instagram/covers',{recursive:true});
for(const plan of plans.filter(p=>!requested.length||requested.includes(p.id))) {
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(plan.id))throw new Error('Invalid queue ID.');
 if(history.posts.some(p=>p.listingId===plan.listingId)){console.log(`Skipped posted property: ${plan.id}`);continue;}
 const row=reviewed.find(p=>p.id===plan.listingId);
 if(!row)throw new Error(`Missing reviewed listing: ${plan.id}`);
 const html=execFileSync('curl',['--fail','--silent','--show-error','--location','--proto','=https','--proto-redir','=https','--max-time','30',row.listingUrl],{encoding:'utf8',maxBuffer:15*1024*1024});
 const source=listingGallery(html,row.listingUrl);
 const listing={...row,price:source.listing.price,acreage:source.listing.acreage,bedrooms:source.listing.bedrooms,bathrooms:source.listing.bathrooms,squareFeet:source.listing.squareFeet};
 const roles=['cover','exterior','land','interior'];
 const selected=roles.map(role=>source.photos[plan.photoIndexes[role]]);
 if(selected.some(x=>!x)||new Set(selected).size!==4)throw new Error(`Four distinct gallery selections required: ${plan.id}`);
 const photo=execFileSync('curl',['--fail','--silent','--show-error','--proto','=https','--max-time','25','--max-filesize','15000000',selected[0]],{maxBuffer:15*1024*1024});
 if(photo[0]!==255||photo[1]!==216)throw new Error('Cover source must be JPEG.');
 const output=`artifacts/instagram-queue/${plan.id}`;await mkdir(output,{recursive:true});
 await writeFile(`${output}/cover.html`,renderInstagramCover({location:plan.coverLocation,price:listing.price,photoData:`data:image/jpeg;base64,${photo.toString('base64')}`}));
 execFileSync('python',['scripts/render-instagram-cover.py',`${output}/cover.html`,`${output}/cover.jpg`],{stdio:'inherit'});
 const cover=await readFile(`${output}/cover.jpg`);const filename=`${createHash('sha256').update(cover).digest('hex').slice(0,20)}.jpg`;
 await writeFile(`public/social/instagram/covers/${filename}`,cover);
 const caption=buildInstagramCaption({...listing,socialNotes:plan.notes},{headline:plan.headline});
 const post={id:plan.id,headline:plan.headline,checkedAt:new Date().toISOString(),listing,caption,slides:roles.map((role,i)=>({role,sourceUrl:selected[i],imageUrl:i===0?`https://raw.githubusercontent.com/nolawi/logcabinscout/main/public/social/instagram/covers/${filename}`:selected[i]}))};
 await writeFile(`${output}/caption.txt`,caption+'\n');await writeFile(`${output}/post.json`,JSON.stringify(post,null,2)+'\n');
 previous.posts=previous.posts.filter(p=>p.id!==post.id);previous.posts.push(post);
 console.log(`Ready: ${post.id} — ${listing.location} — $${listing.price}`);
}
previous.posts.sort((a,b)=>plans.findIndex(p=>p.id===a.id)-plans.findIndex(p=>p.id===b.id));
await writeFile('data/instagram-queue.json',JSON.stringify(previous,null,2)+'\n');
console.log('Queue packages saved. Nothing published.');
