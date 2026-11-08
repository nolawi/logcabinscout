import type { Cabin } from '../types/cabin';
import CabinCard from './CabinCard';

type CabinGridProps = { cabins: Cabin[]; savedIds: ReadonlySet<string>; onToggleSaved: (id: string) => void; emptyMessage?: string };

export default function CabinGrid({ cabins, savedIds, onToggleSaved, emptyMessage }: CabinGridProps) {
  if (cabins.length === 0) {
    return <p className="empty-state" role="status">{emptyMessage ?? 'No cabins match that search.'}</p>;
  }

  return (
    <div className="grid">
      {cabins.map((cabin, index) => (
        <CabinCard key={cabin.id} cabin={cabin} isSaved={savedIds.has(cabin.id)} onToggleSaved={onToggleSaved} variant={(index % 3) + 1} />
      ))}
    </div>
  );
}
