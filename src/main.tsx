import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.scss';
import type { ListingSnapshot } from './hooks/useListings';
const root = document.getElementById('root')!;
const embedded = document.getElementById('listing-snapshot');
let initialFeed: ListingSnapshot | undefined;
if (embedded?.textContent) {
  try {
    const value = JSON.parse(embedded.textContent);
    if (Array.isArray(value.records) && Number.isFinite(value.renderedAt)) initialFeed = value;
  } catch { /* Fetch the feed normally if an embedded snapshot is unavailable. */ }
}
const app = <React.StrictMode><App initialFeed={initialFeed} /></React.StrictMode>;
if (initialFeed) ReactDOM.hydrateRoot(root, app);
else ReactDOM.createRoot(root).render(app);
