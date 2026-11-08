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

  return (
    <article className="card">
      <CabinPhoto key={cabin.photo?.url ?? 'no-photo'} photo={cabin.photo} title={cabin.title} variant={variant} isSample={cabin.isSample} />
      <div className="details">
        <small>{cabin.location}</small>
        <h2>{cabin.title}</h2>
        <strong>{dollars.format(cabin.price)}</strong>
        {cabin.acreage !== null && <p>{cabin.acreage.toLocaleString()} acres</p>}
        {cabin.listingUrl && (
          <a className="listing-link" href={cabin.listingUrl} target="_blank" rel="noopener noreferrer">
            View original listing <ArrowIcon />
          </a>
        )}
      </div>
    </article>
  );
}
