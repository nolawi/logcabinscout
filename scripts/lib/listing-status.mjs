import { pageData } from './public-listings.mjs';

const states = new Set(['active','pending','sold','off_market','unknown']);
export const saleStatus = value => states.has(value) ? value : 'unknown';
const mapped = value => {
 const key=String(value??'').trim().toLowerCase().replace(/[_-]+/g,' ').replace(/\s+/g,' ');
 if(['active','for sale'].includes(key))return 'active';
 if(['pending','under contract','active under contract','contingent','contingent offer','active contingent','accepting backup offers'].includes(key))return 'pending';
 if(['sold','recently sold','closed'].includes(key))return 'sold';
 if(['off market','withdrawn','canceled','cancelled','expired'].includes(key))return 'off_market';
 return null;
};
function propertyFrom(value,zpid){
 if(!value||typeof value!=='object')return undefined;
 if(String(value.zpid)===zpid&&'homeStatus'in value)return value;
 for(const child of Object.values(value)){const found=propertyFrom(child,zpid);if(found)return found;}
}
export function statusFromPage(html,row){
 let url;try{url=new URL(row.listingUrl);}catch{return {status:'unknown',reason:'Unsupported source URL'};}
 const zpid=url.pathname.match(/\/(\d+)_zpid\//)?.[1];
 if(url.protocol!=='https:'||url.hostname!=='www.zillow.com'||url.username||url.password||!zpid||row.id!==`zillow:${zpid}`)return {status:'unknown',reason:'Unsupported source or identity'};
 try{
  let cache=pageData(html)?.props?.pageProps?.componentProps?.gdpClientCache;
  cache=typeof cache==='string'?JSON.parse(cache):cache;
  const property=propertyFrom(cache,zpid);
  if(!property)return {status:'unknown',reason:'Property identity not confirmed'};
  const home=mapped(property.homeStatus),raw=property.attributionInfo?.trueStatus,attributed=mapped(raw);
  // FOR_SALE plus an explicit contract label is a known provider convention.
  if(home&&attributed&&home!==attributed&&!(home==='active'&&attributed==='pending'))return {status:'unknown',reason:'Conflicting source statuses'};
  if(raw&&String(raw).trim()&&!attributed)return {status:'unknown',reason:'Unrecognized source status'};
  if(!home)return {status:'unknown',reason:'Unrecognized primary listing status'};
  const status=attributed??home;
  if(!status)return {status:'unknown',reason:'No explicit supported status'};
  return {status,evidence:`homeStatus=${property.homeStatus}; trueStatus=${raw??'not supplied'}`,sourceUrl:url.href};
 }catch{return {status:'unknown',reason:'Source data unreadable'};}
}

export function applyStatusResults(rows,history,results){
 const reviewed=structuredClone(rows),audit=structuredClone(history??{version:1,attempts:[],changes:[]});
 audit.attempts??=[];audit.changes??=[];
 for(const result of results){
  const row=reviewed.find(r=>r.id===result.id);if(!row)throw new Error('Status result references an unknown listing');
  const checked=Date.parse(result.checkedAt);
  if(!Number.isFinite(checked)||new Date(checked).toISOString()!==result.checkedAt)throw new Error('Invalid check timestamp');
  if(row.statusCheckAttemptAt&&Date.parse(row.statusCheckAttemptAt)>checked)continue;
  const confirmed=['active','pending','sold','off_market'].includes(result.status)&&typeof result.evidence==='string'&&result.evidence.trim()&&result.sourceUrl===row.listingUrl;
  const attempt={...result,status:confirmed?result.status:'unknown'};
  if(audit.attempts.some(a=>a.id===result.id&&a.checkedAt===result.checkedAt))continue;
  row.statusCheckAttemptAt=result.checkedAt;
  row.statusCheckOutcome=confirmed?'confirmed':'unconfirmed';
  if(confirmed){
   const previous=saleStatus(row.saleStatus??row.status);
   if(previous!==result.status)audit.changes.push({id:row.id,from:previous,to:result.status,checkedAt:result.checkedAt,sourceUrl:result.sourceUrl,evidence:result.evidence});
   row.saleStatus=result.status;row.status=result.status;row.statusCheckedAt=result.checkedAt;
   row.statusSourceUrl=result.sourceUrl;row.statusEvidence=result.evidence;
  }
  audit.attempts.push(attempt);
 }
 return {reviewed,history:audit};
}
