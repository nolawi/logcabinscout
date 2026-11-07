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
    <header className="header"><a className="brand" href="#home" aria-label="Log Cabin Scout home"><img src={import.meta.env.BASE_URL + "logo-mark.svg"} alt="" width="58" height="58" /><span className="brand-wordmark">LOG CABIN <strong>SCOUT</strong></span></a><nav aria-label="Main navigation"><a href="#cabins">Browse Cabins</a><a href="#about">Our Story</a></nav></header>
    <main id="home">
      <section className="hero" style={{ backgroundImage: `url(${import.meta.env.BASE_URL}hero-landscape.svg)` }}><div className="hero-inner"><p className="eyebrow">AN INDEPENDENT GUIDE TO LOG HOMES FOR SALE</p><h1>Cabins worth<br/><em>the hunt.</em></h1><p>A carefully curated collection of log cabins for sale, from mountain hideaways to woodland retreats.</p><a className="cta" href="#cabins">Explore the collection <span aria-hidden="true">↗</span></a></div></section>
      <section className="content" id="cabins">
        <div className="section-title">
          <div><p className="eyebrow">THE SCOUTED COLLECTION</p><h2>Find a cabin to call your own.</h2>
            <p>{isLoading ? 'Checking available listings…' : error ? 'The collection is temporarily unavailable.'
              : `${listings.length} sourced cabin ${listings.length === 1 ? 'listing' : 'listings'} checked in the last 30 days.`}</p>
          </div>
        </div>
        {error && <p className="feed-notice" role="status">We couldn’t load the listings. Please refresh the page to try again.</p>}
        {!isLoading && !error && listings.length > 0 && <p className="feed-notice">Listings are shown for 30 days after review. Prices and availability can change; confirm details with the original listing.</p>}
        {!isLoading && !error && listings.length > 0 && <><div className="listing-filters" role="search" aria-label="Filter cabin listings">
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
          <span>{visible.length} {visible.length === 1 ? 'cabin' : 'cabins'} found</span>
          {hasFilters && <button type="button" className="reset-filters" onClick={resetFilters}>Clear filters</button>}
        </div>
        <CabinGrid cabins={visible} /></>}
        {!isLoading && !error && listings.length === 0 && <p className="empty-state" role="status">No current listings. We’re scouting more cabins; check back soon.</p>}
      </section>
      <section className="about" id="about"><p className="eyebrow">A NOTE FROM THE SCOUT</p><h2>For the love of log cabins.</h2><p>There's something special about a home built of logs. We scout distinctive cabins across the country and point you to their original sale listings. No endless scrolling. Just places worth a closer look.</p></section>
    </main>
    <footer><span>© {new Date().getFullYear()} Log Cabin Scout</span><span>Find your place in the woods.</span></footer>
  </>;
}
