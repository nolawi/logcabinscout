import { useMemo, useState } from 'react';
import CabinGrid from './components/CabinGrid';
import { useListings } from './hooks/useListings';

type SortOrder = 'featured' | 'price-asc' | 'price-desc' | 'acreage-desc';

export default function App() {
  const [query, setQuery] = useState('');
  const [state, setState] = useState('all');
  const [maxPrice, setMaxPrice] = useState('all');
  const [sortBy, setSortBy] = useState<SortOrder>('featured');
  const { listings, isLoading, error } = useListings();

  const source = listings;
  const states = useMemo(() => [...new Set(source.map(cabin => cabin.location.split(',').at(-1)?.trim()).filter((value): value is string => Boolean(value)))].sort(), [source]);
  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = source.filter(cabin => {
      const matchesSearch = `${cabin.title} ${cabin.location}`.toLowerCase().includes(search);
      const matchesState = state === 'all' || !states.includes(state) || cabin.location.split(',').at(-1)?.trim() === state;
      const matchesPrice = maxPrice === 'all' || cabin.price <= Number(maxPrice);
      return matchesSearch && matchesState && matchesPrice;
    });
    if (sortBy === 'price-asc') return filtered.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') return filtered.sort((a, b) => b.price - a.price);
    if (sortBy === 'acreage-desc') return filtered.sort((a, b) => (b.acreage ?? -1) - (a.acreage ?? -1));
    return filtered;
  }, [source, query, state, maxPrice, sortBy, states]);

  const resetFilters = () => { setQuery(''); setState('all'); setMaxPrice('all'); setSortBy('featured'); };
  const hasFilters = query !== '' || state !== 'all' || maxPrice !== 'all' || sortBy !== 'featured';

  return <>
    <header className="header"><a className="brand" href={import.meta.env.BASE_URL} aria-label="Log Cabin Scout home"><img src={import.meta.env.BASE_URL + "logo-mark.svg"} alt="" width="40" height="40" /><span className="brand-wordmark">LOG CABIN <strong>SCOUT</strong></span></a></header>
    <main id="home">

      <section className="content" id="cabins">
        <h1 className="sr-only">Log cabins for sale</h1>
        {isLoading && <p role="status">Loading cabins…</p>}
        {error && <p className="feed-notice" role="status">We couldn’t load the listings. Please refresh the page to try again.</p>}
        {!isLoading && !error && listings.length > 0 && <><div className="listing-filters" role="search" aria-label="Filter cabin listings">
          <label className="filter-search"><span className="sr-only">Search</span>
            <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search city, state, or address" />
          </label>
          <label><span className="sr-only">State</span>
            <select value={states.includes(state) ? state : 'all'} onChange={event => setState(event.target.value)}>
              <option value="all">All states</option>
              {states.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label><span className="sr-only">Max price</span>
            <select value={maxPrice} onChange={event => setMaxPrice(event.target.value)}>
              <option value="all">Any price</option>
              <option value="250000">Up to $250,000</option>
              <option value="500000">Up to $500,000</option>
              <option value="750000">Up to $750,000</option>
              <option value="1000000">Up to $1,000,000</option>
            </select>
          </label>
          <label><span className="sr-only">Sort by</span>
            <select value={sortBy} onChange={event => setSortBy(event.target.value as SortOrder)}>
              <option value="featured">Sort: featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="acreage-desc">Acreage: most first</option>
            </select>
          </label>
        </div>
        <div className="results-bar" aria-live="polite">
          <span>{visible.length} {visible.length === 1 ? 'cabin' : 'cabins'}</span>
          {hasFilters && <button type="button" className="reset-filters" onClick={resetFilters}>Clear filters</button>}
        </div>
        <CabinGrid cabins={visible} />
        </>}
        {!isLoading && !error && listings.length === 0 && <p className="empty-state" role="status">No current listings. We’re scouting more cabins; check back soon.</p>}
      </section>

    </main>
    <footer><span>© {new Date().getFullYear()} Log Cabin Scout</span></footer>
  </>;
}
