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
      <CabinPhoto key={cabin.photo?.url ?? 'no-photo'} photo={cabin.photo} title={cabin.title} listingUrl={cabin.listingUrl} variant={variant} isSample={cabin.isSample} />
      <div className="details">
        <small>{cabin.location}</small>
        <h2>{cabin.listingUrl
          ? <a className="card-title-link" href={cabin.listingUrl} target="_blank" rel="noopener noreferrer">{cabin.title}<ArrowIcon /></a>
          : cabin.title}</h2>
        <div className="card-facts">
          <strong>{dollars.format(cabin.price)}</strong>
          {cabin.acreage !== null && <span className="acreage">{cabin.acreage.toLocaleString()} acres</span>}
        </div>
      </div>
    </article>
  );
}
