const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
export function renderInstagramCover({ location, price, photoData }) {
  if (typeof location !== 'string' || !location.trim()) throw new Error('Cover location is required.');
  if (!Number.isFinite(price) || price <= 0) throw new Error('Cover price must be positive.');
  if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(photoData ?? '')) throw new Error('An embedded original photograph is required.');
  const amount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{box-sizing:border-box}html,body{margin:0;padding:0}figure{position:relative;margin:0;width:1280px}img{display:block;width:100%;height:auto}.overlay{position:absolute;left:4.5%;bottom:5.5%;max-width:82%;color:white;text-shadow:0 2px 8px #000,0 1px 2px #000;font-family:Arial,sans-serif;font-weight:700}.location{font-size:33px;letter-spacing:1px;line-height:1.15;margin-bottom:6px}.price{font-size:68px;line-height:1.05}
  </style></head><body><figure><img src="${photoData}" alt="Original property exterior"><div class="overlay"><div class="location">${escape(location.toUpperCase())}</div><div class="price">${escape(amount)}</div></div></figure></body></html>`;
}
