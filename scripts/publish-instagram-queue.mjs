import {readFileSync,writeFileSync,appendFileSync,mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {selectQueuePosts,validateSourceVerification,publishQueueBatch} from './lib/instagram-queue.mjs';
import {publishInstagram} from './lib/instagram-publish.mjs';
import {INSTAGRAM_ACCOUNT_ID} from './lib/meta-connection.mjs';
const historyPath='data/instagram-post-history.json';
try {
 const queue=JSON.parse(readFileSync('data/instagram-queue.json'));
 const history=JSON.parse(readFileSync(historyPath));
 const ids=(process.env.POST_IDS??'').split(',').map(x=>x.trim()).filter(Boolean);
 const posts=selectQueuePosts(queue,history,ids);
 validateSourceVerification(posts,process.env.VERIFICATION_TIME,process.env.VERIFICATION_DIGEST);
 const token=process.env.INSTAGRAM_ACCESS_TOKEN;
 if(!token)throw new Error('INSTAGRAM_ACCESS_TOKEN is missing.');
 const response=await fetch(`https://graph.facebook.com/v27.0/${INSTAGRAM_ACCOUNT_ID}/media?fields=id,caption&limit=100`,{headers:{Authorization:`Bearer ${token}`},redirect:'error',signal:AbortSignal.timeout(25000)});
 const recent=await response.json();
 if(!response.ok||!Array.isArray(recent.data))throw new Error('Could not verify recent Instagram history. No posts attempted.');
 for(const post of posts)if(recent.data.some(item=>item.caption?.includes(post.listing.listingUrl)))throw new Error(`Already present on Instagram: ${post.id}`);
 if(process.env.PUBLISH!=='true'){
  console.log(`Validated ${posts.length} packages against current sources and post history; nothing published.`);
  process.exit(0);
 }
 if(process.env.GITHUB_ACTIONS!=='true')throw new Error('Queue publishing must run inside the authorized GitHub workflow.');
 execFileSync('git',['config','user.name','github-actions[bot]']);
 execFileSync('git',['config','user.email','41898282+github-actions[bot]@users.noreply.github.com']);
 const persist=async value=>{
  writeFileSync(historyPath,JSON.stringify(value,null,2)+'\n');
  execFileSync('git',['add',historyPath]);
  execFileSync('git',['commit','-m','Record Instagram queue state [skip ci]'],{stdio:'inherit'});
  execFileSync('git',['pull','--rebase','origin','main'],{stdio:'inherit'});
  execFileSync('git',['push','origin','HEAD:main'],{stdio:'inherit'});
 };
 await publishQueueBatch({posts,history,persist,publish:async post=>{
  const result=await publishInstagram({token,imageUrls:post.slides.map(x=>x.imageUrl),caption:post.caption,publish:true});
  mkdirSync('artifacts/instagram-receipts',{recursive:true});
  writeFileSync(`artifacts/instagram-receipts/${post.id}.json`,JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({queueId:post.id,...result}));
  if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,`Published ${post.id}: ${result.permalink??result.mediaId}\n`);
  return result;
 }});
} catch(error){console.error(error instanceof SyntaxError?'Queue input or provider response was not valid JSON.':error.message);process.exitCode=1;}
