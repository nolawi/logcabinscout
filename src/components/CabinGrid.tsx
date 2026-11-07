import type { Cabin } from '../types/cabin';
import CabinCard from './CabinCard';

type CabinGridProps = { cabins: Cabin[] };

export default function CabinGrid({ cabins }: CabinGridProps) {
  if (cabins.length === 0) {
    return <p className="empty-state" role="status">No cabins match that search.</p>;
  }

  return (
    <div className="grid">
      {cabins.map((cabin, index) => (
        <CabinCard key={cabin.id} cabin={cabin} variant={(index % 3) + 1} />
      ))}
    </div>
  );
}
