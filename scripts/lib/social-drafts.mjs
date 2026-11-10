const escapeHtml = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const dollars = value => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value);
export function buildInstagramCaption(row, { headline = row.socialTitle || `A Cabin Escape In ${row.location.split(',')[0].trim()}` } = {}) {
  if (typeof headline !== 'string' || !headline.trim() || /[\r\n]/.test(headline) || headline.length > 100) throw new Error('Caption headline must be one short line.');
  const facts = [dollars(row.price),row.acreage==null?null:`${row.acreage.toLocaleString('en-US')} acres`].filter(Boolean).join(' · ');
  const rooms = [row.bedrooms==null?null:`${row.bedrooms} ${row.bedrooms===1?'bed':'beds'}`,row.bathrooms==null?null:`${row.bathrooms} ${row.bathrooms===1?'bath':'baths'}`,row.squareFeet==null?null:`${row.squareFeet.toLocaleString('en-US')} sq ft`].filter(Boolean).join(' · ');
  const state = row.location.split(',').at(-1).trim().replace(/[^A-Za-z]/g,'');
  const localTag = state ? `#${state}RealEstate` : '#CabinForSale';
  const hashtags = `#LogCabinScout #LogCabinsForSale #CabinLife #LogCabin ${localTag}`;
  const credit = (row.photo?.credit || 'Listing provider').replace(/[.\s]+$/,'');
  return [`${headline.trim()}\n${row.listingUrl}`,`${row.title} · ${row.location}\n${facts}${rooms?`\n${rooms}`:''}`,row.socialNotes || null,hashtags,`Photos: ${credit}.`].filter(Boolean).join('\n\n');
}
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
      caption:buildInstagramCaption(row),
      altText:`${row.photo.alt || `Property photograph of ${row.title}, ${row.location}`}. Asking ${dollars(row.price)}${row.acreage==null?'':`, ${row.acreage} acres`}. Photo: ${row.photo.credit || 'Listing provider'}.`,
    };
  });
}
export function renderSocialCard(draft,logo,photoData) {
  if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(photoData ?? '')) throw new Error('An embedded property photograph is required.');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>*{box-sizing:border-box}html,body{margin:0;padding:0;background:transparent}img{display:block;width:1080px;height:auto}</style></head><body><img src="${photoData}" alt="${escapeHtml(draft.photo.alt || '')}"></body></html>`;
}
