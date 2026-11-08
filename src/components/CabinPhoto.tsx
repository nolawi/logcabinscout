import { useState } from 'react';
import type { PropertyPhoto } from '../lib/photo.mjs';

const assetUrl = (url: string) => url.startsWith('/') ? `${import.meta.env.BASE_URL}${url.slice(1)}` : url;

type CabinPhotoProps = { photo?: PropertyPhoto; title: string; variant: number; isSample?: boolean };

/** Key this component by image URL so a changed photo gets a fresh loading state. */
export default function CabinPhoto({ photo, title, variant, isSample }: CabinPhotoProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const showImage = Boolean(photo) && status !== 'failed';
  const caption = !photo ? 'Property photo not available' : status === 'failed' ? 'Property photo unavailable' : 'Loading property photo…';

  return <figure className={`property-photo placeholder-${variant}`}>
    <div className="photo-frame">
    {status !== 'loaded' && <div className="photo-fallback">
      <img src={`${import.meta.env.BASE_URL}logo-mark.svg`} alt="" width="76" height="76" />
      <span className="photo-caption">{caption}</span>
      <span className="photo-note">{photo && status === 'loading' ? 'A closer look is on its way' : 'Explore the original listing for more details'}</span>
    </div>}
    {showImage && photo && <img className={`cabin-image${status === 'loaded' ? ' is-loaded' : ''}`} src={assetUrl(photo.url)} srcSet={photo.variants.length ? photo.variants.map(item => `${assetUrl(item.url)} ${item.width}w`).join(', ') : undefined} sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 820px) 45vw, (max-width: 1300px) 30vw, 380px" width={photo.width} height={photo.height} style={{ objectFit: photo.allowCropping ? 'cover' : 'contain' }} alt={photo.alt || title} loading="lazy" decoding="async" onLoad={() => setStatus('loaded')} onError={() => setStatus('failed')} />}
    {isSample && <span className="sample-badge">Sample listing</span>}
    </div>
    {photo && status !== 'failed' && <figcaption className="photo-credit">Photo: <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">{photo.credit}<span className="sr-only"> (opens in a new tab)</span></a></figcaption>}
  </figure>;
}
