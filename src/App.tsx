import { useState } from 'react';

const previews = [
  { name: 'Blue Ridge Retreat', location: 'Virginia', price: '$389,000', acreage: '4.6 acres' },
  { name: 'Pine Ridge Cabin', location: 'North Carolina', price: '$465,000', acreage: '2.8 acres' },
  { name: 'Mountain Timber Home', location: 'Tennessee', price: '$525,000', acreage: '6.2 acres' },
];

export default function App() {
  const [query, setQuery] = useState('');
  const visible = previews.filter(item => `${item.name} ${item.location}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <header className="header"><a className="brand" href="#home">⌂ Log Cabin <strong>Scout</strong></a><nav><a href="#cabins">Explore</a><a href="#about">About</a></nav></header>
    <main id="home">
      <section className="hero"><p className="eyebrow">DISCOVER SOMETHING DIFFERENT</p><h1>Find your place<br/><em>in the woods.</em></h1><p>Explore log cabins for sale across the United States.</p><a className="cta" href="#cabins">Explore cabins ↗</a></section>
      <section className="content" id="cabins"><div className="section-title"><div><p className="eyebrow">DISCOVER</p><h2>Cabins worth exploring</h2><p>Illustrative preview listings. Real properties are coming next.</p></div><label><span className="sr-only">Search sample listings</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search locations..." /></label></div>
        <div className="grid">{visible.map((item, i) => <article className="card" key={item.name}><div className={`placeholder placeholder-${i + 1}`}><span>Sample listing</span><span className="mountains" aria-hidden="true">⌂</span></div><div className="details"><small>{item.location}</small><h3>{item.name}</h3><strong>{item.price}</strong><p>{item.acreage} · Log home</p></div></article>)}</div>{visible.length === 0 && <p>No samples match that search.</p>}
      </section>
      <section className="about" id="about"><p className="eyebrow">ABOUT LOG CABIN SCOUT</p><h2>Less scrolling. More dreaming.</h2><p>We're building a simple way to discover log cabins for sale, with links to their original listings.</p></section>
    </main><footer>© {new Date().getFullYear()} Log Cabin Scout</footer>
  </>;
}
