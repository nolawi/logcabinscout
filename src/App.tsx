import { useMemo, useState } from 'react';
import CabinGrid from './components/CabinGrid';
import { sampleCabins } from './data/sampleCabins';
import { useListings } from './hooks/useListings';

type SortOrder = 'featured' | 'price-asc' | 'price-desc' | 'acreage-desc';

export default function App() {
  const [query, setQuery] = useState('');
  const [state, setState] = useState('all');
  const [maxPrice, setMaxPrice] = useState('all');
  const [sortBy, setSortBy] = useState<SortOrder>('featured');
  const { listings, isLoading, error } = useListings();

  const isPreview = listings.length === 0;
  const source = isPreview ? sampleCabins : listings;
  const states = useMemo(() => [...new Set(source.map(cabin => cabin.location.split(',').at(-1)?.trim()).filter((value): value is string => Boolean(value)))].sort(), [source]);
  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = source.filter(cabin => {
      const matchesSearch = `${cabin.title} ${cabin.location}`.toLowerCase().includes(search);
      const matchesState = state === 'all' || cabin.location.split(',').at(-1)?.trim() === state;
      const matchesPrice = maxPrice === 'all' || cabin.price <= Number(maxPrice);
      return matchesSearch && matchesState && matchesPrice;
    });
    if (sortBy === 'price-asc') return filtered.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') return filtered.sort((a, b) => b.price - a.price);
    if (sortBy === 'acreage-desc') return filtered.sort((a, b) => (b.acreage ?? -1) - (a.acreage ?? -1));
    return filtered;
  }, [source, query, state, maxPrice, sortBy]);

  const resetFilters = () => { setQuery(''); setState('all'); setMaxPrice('all'); setSortBy('featured'); };
  const hasFilters = query !== '' || state !== 'all' || maxPrice !== 'all' || sortBy !== 'featured';

  return <>
    <header className="header"><a className="brand" href="#home">⌂ Log Cabin <strong>Scout</strong></a><nav aria-label="Main navigation"><a href="#cabins">Explore</a><a href="#about">About</a></nav></header>
    <main id="home">
      <section className="hero"><p className="eyebrow">DISCOVER SOMETHING DIFFERENT</p><h1>Find your place<br/><em>in the woods.</em></h1><p>Explore log cabins for sale across the United States.</p><a className="cta" href="#cabins">Explore cabins ↗</a></section>
      <section className="content" id="cabins">
        <div className="section-title">
          <div><p className="eyebrow">DISCOVER</p><h2>Cabins worth exploring</h2>
            <p>{isLoading ? 'Checking available listings…' : isPreview
              ? 'Illustrative preview listings. Real properties are coming next.'
              : `${listings.length} sourced cabin listings in our collection.`}</p>
          </div>
        </div>
        {error && <p className="feed-notice" role="status">Live listings are unavailable. Showing sample properties instead.</p>}
        {isPreview && !error && !isLoading && <p className="feed-notice">Preview only — these are fictional listings, not properties currently for sale.</p>}
        <div className="listing-filters" role="search" aria-label="Filter cabin listings">
          <label className="filter-search">Search
            <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="City, state, or cabin..." />
          </label>
          <label>State
            <select value={states.includes(state) ? state : 'all'} onChange={event => setState(event.target.value)}>
              <option value="all">All states</option>
              {states.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label>Max price
            <select value={maxPrice} onChange={event => setMaxPrice(event.target.value)}>
              <option value="all">Any price</option>
              <option value="250000">$250,000</option>
              <option value="500000">$500,000</option>
              <option value="750000">$750,000</option>
              <option value="1000000">$1,000,000</option>
            </select>
          </label>
          <label>Sort by
            <select value={sortBy} onChange={event => setSortBy(event.target.value as SortOrder)}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="acreage-desc">Acreage: most first</option>
            </select>
          </label>
        </div>
        <div className="results-bar" aria-live="polite">
          <span>{visible.length} {visible.length === 1 ? 'cabin' : 'cabins'} found{isPreview ? ' (sample data)' : ''}</span>
          {hasFilters && <button type="button" className="reset-filters" onClick={resetFilters}>Clear filters</button>}
        </div>
        <CabinGrid cabins={visible} />
      </section>
      <section className="about" id="about"><p className="eyebrow">ABOUT LOG CABIN SCOUT</p><h2>Less scrolling. More dreaming.</h2><p>We're building a simple way to discover log cabins for sale, with links to their original listings.</p></section>
    </main>
    <footer>© {new Date().getFullYear()} Log Cabin Scout</footer>
  </>;
}
