import { useState } from 'react';

type CabinPhotoProps = { imageUrl?: string; title: string; variant: number; isSample?: boolean };

/** Key this component by image URL so a changed photo gets a fresh loading state. */
export default function CabinPhoto({ imageUrl, title, variant, isSample }: CabinPhotoProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const showImage = Boolean(imageUrl) && status !== 'failed';
  const caption = !imageUrl ? 'Property photo not available' : status === 'failed' ? 'Property photo unavailable' : 'Loading property photo…';

  return <div className={`property-photo placeholder-${variant}`}>
    {status !== 'loaded' && <div className="photo-fallback">
      <img src={`${import.meta.env.BASE_URL}logo-mark.svg`} alt="" width="76" height="76" />
      <span className="photo-caption">{caption}</span>
      <span className="photo-note">{imageUrl && status === 'loading' ? 'A closer look is on its way' : 'Explore the original listing for more details'}</span>
    </div>}
    {showImage && <img className={`cabin-image${status === 'loaded' ? ' is-loaded' : ''}`} src={imageUrl} alt={title} loading="lazy" decoding="async" onLoad={() => setStatus('loaded')} onError={() => setStatus('failed')} />}
    {isSample && <span className="sample-badge">Sample listing</span>}
  </div>;
}
