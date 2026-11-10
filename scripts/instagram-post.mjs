import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {selectQueuePosts} from './lib/instagram-queue.mjs';
const args=process.argv.slice(2);
const queue=JSON.parse(readFileSync('data/instagram-queue.json'));
const history=JSON.parse(readFileSync('data/instagram-post-history.json'));
if(!args.length||args.includes('--list')){
 for(const post of queue.posts){const entry=history.posts.find(x=>x.listingId===post.listing.id);console.log(`${entry?.state??'ready'}\t${post.id}\t${post.listing.location}\t$${post.listing.price}`);}
}else{
 const check=args.includes('--check');const ids=args.filter(x=>x!=='--check');selectQueuePosts(queue,history,ids);
 execFileSync('gh',['api','--method','POST','repos/nolawi/logcabinscout/actions/workflows/instagram-queue.yml/dispatches','--input','-'],{input:JSON.stringify({ref:'main',inputs:{post_ids:ids.join(','),publish:!check}}),stdio:['pipe','inherit','inherit']});
 console.log(`${check?'Check':'Publishing'} requested for: ${ids.join(', ')}. Follow the Instagram queue workflow in GitHub Actions.`);
}
