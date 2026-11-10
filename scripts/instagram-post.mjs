import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {listingGallery} from './lib/public-listings.mjs';
import {selectQueuePosts,verifyQueueSource,sourceVerification} from './lib/instagram-queue.mjs';
const args=process.argv.slice(2);
const queue=JSON.parse(readFileSync('data/instagram-queue.json'));
const history=JSON.parse(readFileSync('data/instagram-post-history.json'));
if(!args.length||args.includes('--list')){
 for(const post of queue.posts){const entry=history.posts.find(x=>x.listingId===post.listing.id);console.log(`${entry?.state??'ready'}\t${post.id}\t${post.listing.location}\t$${post.listing.price}`);}
}else{
 const check=args.includes('--check');const ids=args.filter(x=>x!=='--check');const posts=selectQueuePosts(queue,history,ids);
 for(const post of posts){
  const html=execFileSync('curl',['--fail','--silent','--show-error','--location','--proto','=https','--proto-redir','=https','--max-time','30',post.listing.listingUrl],{encoding:'utf8',maxBuffer:15*1024*1024});
  verifyQueueSource(post,listingGallery(html,post.listing.listingUrl));
 }
 const verification=sourceVerification(posts);
 execFileSync('gh',['api','--method','POST','repos/nolawi/logcabinscout/actions/workflows/instagram-queue.yml/dispatches','--input','-'],{input:JSON.stringify({ref:'main',inputs:{post_ids:ids.join(','),publish:!check,...verification}}),stdio:['pipe','inherit','inherit']});
 console.log(`${check?'Check':'Publishing'} requested for: ${ids.join(', ')}. Follow the Instagram queue workflow in GitHub Actions.`);
}
