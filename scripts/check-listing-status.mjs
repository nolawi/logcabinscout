import {readFile,writeFile,mkdir,open,rm,rename}from'node:fs/promises';
import{execFile}from'node:child_process';import{promisify}from'node:util';
import{statusFromPage,applyStatusResults}from'./lib/listing-status.mjs';
import{buildFeed}from'./lib/build-feed.mjs';import{STATE_NAMES}from'./lib/discovery-schedule.mjs';
const execute=promisify(execFile),args=process.argv.slice(2);let apply=false,limit=10,days=7,state='',ids=[];
const usage='npm run listings:status -- [--apply] [--limit 1-100] [--days 0-365] [--state VA] [--id zillow:123 ...]';
let lock;
try{
 for(let i=0;i<args.length;i++){
  const arg=args[i];if(arg==='--help'){console.log(usage);process.exit(0);}
  if(arg==='--apply'){apply=true;continue;}
  if(!['--limit','--days','--state','--id'].includes(arg)||!args[i+1]||args[i+1].startsWith('--'))throw new Error(usage);
  const value=args[++i];if(arg==='--limit')limit=Number(value);if(arg==='--days')days=Number(value);if(arg==='--state')state=value.toUpperCase();if(arg==='--id')ids.push(value);
 }
 if(!Number.isInteger(limit)||limit<1||limit>100||!Number.isInteger(days)||days<0||days>365||(state&&!STATE_NAMES[state]))throw new Error(usage);
 await mkdir('artifacts',{recursive:true});
 lock=await open('artifacts/review.lock','wx');
 const source='data/reviewed-listings.json',feed='public/listings.json',ledger='data/listing-status-history.json';
 const original=await readFile(source,'utf8'),rows=JSON.parse(original);
 if(ids.some(id=>!rows.some(row=>row.id===id)))throw new Error('Unknown listing ID');
 const now=Date.now();
 const selected=rows.filter(row=>row.verified===true&&(!state||row.location.split(',').at(-1).trim()===STATE_NAMES[state])&&(!ids.length||ids.includes(row.id)))
  .filter(row=>ids.length||!row.statusCheckAttemptAt||!Number.isFinite(Date.parse(row.statusCheckAttemptAt))||now-Date.parse(row.statusCheckAttemptAt)>=days*86400000)
  .sort((a,b)=>Date.parse(a.statusCheckAttemptAt??'1970-01-01')-Date.parse(b.statusCheckAttemptAt??'1970-01-01')).slice(0,limit);
 const cache=new Map(),results=[];let sourceRequests=0;
 for(const row of selected){
  let result;
  if(!/^https:\/\/www\.zillow\.com\/homedetails\/[^?#]+\/\d+_zpid\/$/.test(row.listingUrl)||!row.id.startsWith('zillow:'))result={status:'unknown',reason:'Source adapter not yet supported'};
  else{
   if(!cache.has(row.listingUrl)){
    sourceRequests++;
    try{const{stdout}=await execute('curl',['--proto','=https','--proto-redir','=https','--fail','--silent','--show-error','--location','--max-time','20','--max-filesize','12000000',row.listingUrl],{maxBuffer:12*1024*1024});cache.set(row.listingUrl,stdout);}
    catch{cache.set(row.listingUrl,null);}
   }
   const html=cache.get(row.listingUrl);result=html?statusFromPage(html,row):{status:'unknown',reason:'Source unavailable; no status inferred'};
  }
  results.push({id:row.id,...result,checkedAt:new Date().toISOString()});
 }
 let history;try{history=JSON.parse(await readFile(ledger,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;history={version:1,attempts:[],changes:[]};}
 const updated=applyStatusResults(rows,history,results);
 const report={mode:apply?'apply':'preview',sourceRequests,checked:results.length,confirmed:results.filter(r=>r.status!=='unknown').length,unconfirmed:results.filter(r=>r.status==='unknown').length,changes:updated.history.changes.slice(history.changes.length),results};
 await writeFile('artifacts/listing-status-report.json',JSON.stringify(report,null,2)+'\n');
 if(apply){
  if(await readFile(source,'utf8')!==original)throw new Error('Reviewed source changed; run again');
  const writes=[[source,JSON.stringify(updated.reviewed,null,2)+'\n'],[feed,JSON.stringify(buildFeed(updated.reviewed),null,2)+'\n'],[ledger,JSON.stringify(updated.history,null,2)+'\n']];
  const backups=[];const suffix=`.status-${process.pid}.tmp`;
  try{
   for(const[path,contents]of writes){let previous=null;try{previous=await readFile(path,'utf8');}catch(error){if(error.code!=='ENOENT')throw error;}backups.push([path,previous]);await writeFile(path+suffix,contents,{flag:'wx'});}
   for(const[path]of writes)await rename(path+suffix,path);
  }catch(error){for(const[path,contents]of backups){if(contents===null)await rm(path,{force:true});else await writeFile(path,contents);}throw error;}
  finally{for(const[path]of writes)await rm(path+suffix,{force:true});}
 }
 console.log(JSON.stringify(report,null,2));
}catch(error){console.error(error.code==='EEXIST'?'Another listing-status operation holds the lock.':error.message);process.exitCode=1;}
finally{if(lock){await lock.close();await rm('artifacts/review.lock',{force:true});}}
