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
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>*{box-sizing:border-box}html,body{margin:0;padding:0;background:transparent}img{display:block;width:1080px;height:auto}</style></head><body><img src="${photoData}" alt="${escapeHtml(draft.photo.alt || '')}"></body></html>`;
}
