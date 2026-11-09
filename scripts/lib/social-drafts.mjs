const escapeHtml = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const dollars = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value);
export function prepareSocialDrafts(listings,date=new Date()) {
  if (!Number.isFinite(date.getTime())) throw new Error('Invalid draft date');
  const available = [...listings].filter(row => !row.isSample && row.price > 0 && row.listingUrl && row.photo?.url).sort((a,b)=>a.id.localeCompare(b.id));
  if (!available.length) return [];
  const week = Math.floor((date.getTime()-4*86400000)/(7*86400000));
  const start = ((week*2)%available.length+available.length)%available.length;
  const first = available[start];
  const remainder = Array.from({length:available.length-1},(_,i)=>available[(start+i+1)%available.length]);
  const second = remainder.find(row=>row.location.split(',').at(-1)!==first.location.split(',').at(-1)) ?? remainder[0];
  return [first,second].filter(Boolean).map(row=>{
    const facts = [dollars(row.price),row.acreage==null?null:`${row.acreage.toLocaleString('en-US')} acres`].filter(Boolean).join(' · ');
    return {
      listingId:row.id,title:row.title,location:row.location,price:row.price,facts,sourceUrl:row.listingUrl,photo:row.photo,
      caption:`Cabin spotlight: ${row.location}\n${row.title}\n${facts}\n\nFull listing: ${row.listingUrl}\nPhotos: ${row.photo.credit || 'Listing provider'}.\nPrices and availability can change.\n\n#LogCabinScout #LogCabinsForSale #CabinLife`,
      altText:`${row.photo.alt || `Property photograph of ${row.title}, ${row.location}`}. Asking ${dollars(row.price)}${row.acreage==null?'':`, ${row.acreage} acres`}. Photo: ${row.photo.credit || 'Listing provider'}.`,
    };
  });
}
export function renderSocialCard(draft,logo,photoData) {
  if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(photoData ?? '')) throw new Error('An embedded property photograph is required.');
  const safe=escapeHtml;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
*{box-sizing:border-box}body{margin:0;width:1080px;height:1350px;background:#f6f0e4;color:#243e32;font-family:Georgia,serif;overflow:hidden;position:relative}header{display:flex;align-items:center;gap:18px;height:130px;padding:25px 48px;font:700 27px Georgia,serif}header svg{width:74px;height:74px;flex-shrink:0}.photo{width:1080px;height:760px;background:#e8e2d6;display:flex;align-items:center;justify-content:center}.photo img{display:block;width:100%;height:100%;object-fit:contain}.credit{font:17px Arial,sans-serif;margin:14px 48px;color:#566157}.main{padding:18px 48px 0}h1{font-size:49px;line-height:1.1;letter-spacing:-1px;margin:0 0 14px;overflow-wrap:anywhere}.address{font:25px/1.3 Arial,sans-serif;margin:0 0 18px}.facts{font:38px Georgia,serif;color:#a75139;margin:0}footer{position:absolute;bottom:36px;left:48px;right:48px;border-top:1px solid #d9d0bf;padding-top:20px;font:20px Arial,sans-serif}.edge{position:absolute;bottom:0;left:0;right:0;height:8px;background:#a75139}
</style></head><body><header>${logo}<span>LOG CABIN SCOUT</span></header><div class="photo"><img src="${photoData}" alt="${safe(draft.photo.alt || '')}"></div><p class="credit">Photo: ${safe(draft.photo.credit || 'Listing provider')}</p><main class="main"><h1>${safe(draft.location)}</h1><p class="address">${safe(draft.title)}</p><p class="facts">${safe(draft.facts)}</p></main><footer>Full listing and photo source in the caption</footer><div class="edge"></div></body></html>`;
}
