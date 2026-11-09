const escapeHtml = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const dollars = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value);
export function prepareSocialDrafts(listings,date=new Date()) {
  if (!Number.isFinite(date.getTime())) throw new Error('Invalid draft date');
  const available = [...listings].filter(row => !row.isSample && row.price > 0 && row.listingUrl).sort((a,b)=>a.id.localeCompare(b.id));
  if (!available.length) return [];
  const week = Math.floor((date.getTime()-4*86400000)/(7*86400000));
  const start = ((week*2)%available.length+available.length)%available.length;
  const first = available[start];
  const remainder = Array.from({length:available.length-1},(_,i)=>available[(start+i+1)%available.length]);
  const second = remainder.find(row=>row.location.split(',').at(-1)!==first.location.split(',').at(-1)) ?? remainder[0];
  return [first,second].filter(Boolean).map(row=>{
    const facts = [dollars(row.price),row.acreage==null?null:`${row.acreage.toLocaleString('en-US')} acres`].filter(Boolean).join(' · ');
    return {
      listingId:row.id,title:row.title,location:row.location,price:row.price,facts,sourceUrl:row.listingUrl,
      caption:`Cabin spotlight: ${row.location}\n${row.title}\n${facts}\n\nBrowse cabins at elancabin.com — link in bio.\nOriginal listing: ${row.listingUrl}\nPrices and availability can change.\n\n#LogCabinScout #LogCabinsForSale #CabinLife`,
      altText:`Log Cabin Scout branded text card: ${row.title}, ${row.location}. Asking ${dollars(row.price)}${row.acreage==null?'':`, ${row.acreage} acres`}. Original cabin emblem and landscape illustration; no property photograph.`,
    };
  });
}
export function renderSocialCard(draft,logo,landscape='') {
  const safe=escapeHtml;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
*{box-sizing:border-box}body{margin:0;width:1080px;height:1350px;background:#f6f0e4;color:#243e32;font-family:Georgia,serif;overflow:hidden;position:relative}header{display:flex;align-items:center;gap:20px;padding:70px 76px;font:700 28px Georgia,serif}header svg{width:88px;height:88px;flex-shrink:0}.landscape{position:absolute;bottom:110px;left:0;right:0;height:410px;opacity:.25}.landscape svg{width:100%;height:100%}.main{position:relative;z-index:1}footer{z-index:1}.rule{height:2px;background:#243e32;margin:0 76px}.main{padding:85px 76px}.label{font:700 19px Arial,sans-serif;letter-spacing:5px;color:#a75139;margin-bottom:30px}h1{font-size:80px;line-height:1.15;letter-spacing:-2px;margin:0 0 40px;overflow-wrap:anywhere}.address{font:28px/1.5 Arial,sans-serif;color:#566157;margin:0 0 65px}.price{font-size:84px;color:#a75139;margin:0 0 20px}.acreage{font:29px Arial,sans-serif;color:#566157}footer{position:absolute;bottom:76px;left:76px;right:76px;border-top:1px solid #d9d0bf;padding-top:30px;display:flex;justify-content:space-between;font:21px Arial,sans-serif}.edge{position:absolute;bottom:0;left:0;right:0;height:10px;background:#a75139}
</style></head><body><header>${logo}<span>LOG CABIN SCOUT</span></header><div class="rule"></div><div class="landscape">${landscape}</div><main class="main"><p class="label">CABIN SPOTLIGHT</p><h1>${safe(draft.location)}</h1><p class="address">${safe(draft.title)}</p><p class="price">${safe(dollars(draft.price))}</p>${draft.facts.includes('acres')?`<p class="acreage">${safe(draft.facts.split(' · ').slice(1).join(' · '))}</p>`:''}</main><footer><span>ELANCABIN.COM</span><span>Details in the caption</span></footer><div class="edge"></div></body></html>`;
}
