import type { Cabin } from '../types/cabin';

type CabinCardProps = { cabin: Cabin; variant?: number };

const dollars = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function CabinCard({ cabin, variant = 1 }: CabinCardProps) {
  const details = [
    cabin.acreage === null ? null : `${cabin.acreage.toLocaleString()} acres`,
    cabin.propertyType,
  ].filter(Boolean).join(' · ');

  return (
    <article className="card">
      <div className={`placeholder placeholder-${variant}`}>
        {cabin.imageUrl ? <img className="cabin-image" src={cabin.imageUrl} alt={cabin.title} loading="lazy" /> : <span className="mountains" aria-hidden="true">⌂</span>}
        {cabin.isSample && <span className="sample-badge">Sample listing</span>}
      </div>
      <div className="details">
        <small>{cabin.location}</small>
        <h3>{cabin.title}</h3>
        <strong>{dollars.format(cabin.price)}</strong>
        <p>{details}</p>
        {cabin.listingUrl && (
          <a className="listing-link" href={cabin.listingUrl} target="_blank" rel="noopener noreferrer">
            View original listing <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </article>
  );
}
