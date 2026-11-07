import { useMemo, useState } from 'react';
import CabinGrid from './components/CabinGrid';
import { sampleCabins } from './data/sampleCabins';
import { useListings } from './hooks/useListings';

export default function App() {
  const [query, setQuery] = useState('');
  const { listings, isLoading, error } = useListings();
  const isPreview = listings.length === 0;
  const source = isPreview ? sampleCabins : listings;
  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();
    return source.filter((cabin) =>
      `${cabin.title} ${cabin.location}`.toLowerCase().includes(search)
    );
  }, [query, source]);

  return <>
    <header className="header"><a className="brand" href="#home">⌂ Log Cabin <strong>Scout</strong></a><nav aria-label="Main navigation"><a href="#cabins">Explore</a><a href="#about">About</a></nav></header>
    <main id="home">
      <section className="hero"><p className="eyebrow">DISCOVER SOMETHING DIFFERENT</p><h1>Find your place<br/><em>in the woods.</em></h1><p>Explore log cabins for sale across the United States.</p><a className="cta" href="#cabins">Explore cabins ↗</a></section>
      <section className="content" id="cabins">
        <div className="section-title">
          <div><p className="eyebrow">DISCOVER</p><h2>Cabins worth exploring</h2>
            <p>{isLoading ? 'Checking available listings…' : isPreview
              ? 'Illustrative preview listings. Real properties are coming next.'
              : `${listings.length} verified listings from our collection.`}</p>
          </div>
          <label><span className="sr-only">Search listings by title or location</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search locations..." /></label>
        </div>
        {error && <p className="feed-notice" role="status">Live listings are unavailable. Showing sample properties instead.</p>}
        {isPreview && !error && !isLoading && <p className="feed-notice">Preview only — these are fictional listings, not properties currently for sale.</p>}
        <CabinGrid cabins={visible} />
      </section>
      <section className="about" id="about"><p className="eyebrow">ABOUT LOG CABIN SCOUT</p><h2>Less scrolling. More dreaming.</h2><p>We're building a simple way to discover log cabins for sale, with links to their original listings.</p></section>
    </main>
    <footer>© {new Date().getFullYear()} Log Cabin Scout</footer>
  </>;
}
