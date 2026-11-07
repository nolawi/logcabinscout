import ArrowIcon from './ArrowIcon';
import CabinPhoto from './CabinPhoto';
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
      <CabinPhoto key={cabin.imageUrl ?? 'no-photo'} imageUrl={cabin.imageUrl} title={cabin.title} variant={variant} isSample={cabin.isSample} />
      <div className="details">
        <small>{cabin.location}</small>
        <h3>{cabin.title}</h3>
        <strong>{dollars.format(cabin.price)}</strong>
        <p>{details}</p>
        {cabin.lastCheckedAt && <p className="listing-checked">Last checked <time dateTime={cabin.lastCheckedAt}>{new Date(cabin.lastCheckedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</time></p>}
        {cabin.listingUrl && (
          <a className="listing-link" href={cabin.listingUrl} target="_blank" rel="noopener noreferrer">
            View original listing <ArrowIcon />
          </a>
        )}
      </div>
    </article>
  );
}
