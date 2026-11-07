import { useMemo, useState } from 'react';
import CabinGrid from './components/CabinGrid';
import { sampleCabins } from './data/sampleCabins';

export default function App() {
  const [query, setQuery] = useState('');
  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();
    return sampleCabins.filter((cabin) =>
      `${cabin.title} ${cabin.location}`.toLowerCase().includes(search)
    );
  }, [query]);

  return <>
    <header className="header"><a className="brand" href="#home">⌂ Log Cabin <strong>Scout</strong></a><nav aria-label="Main navigation"><a href="#cabins">Explore</a><a href="#about">About</a></nav></header>
    <main id="home">
      <section className="hero"><p className="eyebrow">DISCOVER SOMETHING DIFFERENT</p><h1>Find your place<br/><em>in the woods.</em></h1><p>Explore log cabins for sale across the United States.</p><a className="cta" href="#cabins">Explore cabins ↗</a></section>
      <section className="content" id="cabins">
        <div className="section-title">
          <div><p className="eyebrow">DISCOVER</p><h2>Cabins worth exploring</h2><p>Illustrative preview listings. Real properties are coming next.</p></div>
          <label><span className="sr-only">Search sample listings</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search locations..." /></label>
        </div>
        <CabinGrid cabins={visible} />
      </section>
      <section className="about" id="about"><p className="eyebrow">ABOUT LOG CABIN SCOUT</p><h2>Less scrolling. More dreaming.</h2><p>We're building a simple way to discover log cabins for sale, with links to their original listings.</p></section>
    </main>
    <footer>© {new Date().getFullYear()} Log Cabin Scout</footer>
  </>;
}
