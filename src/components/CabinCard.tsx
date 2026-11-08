import ArrowIcon from './ArrowIcon';
import CabinPhoto from './CabinPhoto';
import type { Cabin } from '../types/cabin';

type CabinCardProps = { cabin: Cabin; variant?: number; isSaved: boolean; onToggleSaved: (id: string) => void };

const dollars = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function CabinCard({ cabin, variant = 1, isSaved, onToggleSaved }: CabinCardProps) {
  return (
    <article className="card">
      <div className="card-media">
      <CabinPhoto key={cabin.photo?.url ?? 'no-photo'} photo={cabin.photo} title={cabin.title} listingUrl={cabin.listingUrl} variant={variant} isSample={cabin.isSample} />
      <button type="button" className="save-button" aria-label={`Save ${cabin.title}`} aria-pressed={isSaved} title={isSaved ? 'Remove from saved cabins' : 'Save cabin'} onClick={() => onToggleSaved(cabin.id)}>
        <svg viewBox="0 0 24 24" width="21" height="21" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
      </button>
      </div>
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
