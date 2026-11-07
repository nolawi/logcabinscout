const text = value => typeof value === 'string' ? value.trim() : '';
const https = value => {
  try {
    const url = new URL(text(value));
    return url.protocol === 'https:' && !url.username && !url.password ? url.href.replaceAll(',', '%2C') : undefined;
  } catch { return undefined; }
};
const imageUrl = value => /^\/images\/properties\/[a-z\d/_-]+\.(avif|webp|jpe?g|png)$/i.test(text(value))
  ? text(value) : https(value);
const dimension = value => Number.isInteger(value) && value > 0 && value <= 20000;

/** Validate display metadata. Missing credit or provenance keeps the placeholder. */
export function parsePhoto(input) {
  if (!input || typeof input !== 'object') return undefined;
  const url = imageUrl(input.url);
  const sourceUrl = https(input.sourceUrl);
  const alt = text(input.alt);
  const credit = text(input.credit);
  if (!url || !sourceUrl || !alt || !credit || !dimension(input.width) || !dimension(input.height)) return undefined;
  const allowCropping = input.allowCropping === true;
  const variants = [];
  if (Array.isArray(input.variants)) {
    for (const variant of input.variants) {
      const candidate = imageUrl(variant?.url);
      if (candidate && dimension(variant.width) && !variants.some(item => item.width === variant.width)) {
        variants.push({ url: candidate, width: variant.width });
      }
    }
  }
  variants.sort((a, b) => a.width - b.width);
  return { url, sourceUrl, alt, credit, width: input.width, height: input.height, allowCropping, variants };
}

