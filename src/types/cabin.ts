import type { PropertyPhoto } from '../lib/photo.mjs';

/** Listing shape shared by cards and future data providers. */
export type Cabin = {
  id: string;
  title: string;
  location: string;
  price: number;
  saleStatus?: 'active' | 'pending' | 'sold' | 'off_market' | 'unknown';
  statusLabel?: string;
  availabilityConfirmed?: boolean;
  priceIsHistorical?: boolean;
  statusCheckedAt?: string;
  acreage: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  squareFeet?: number | null;
  propertyType: string;
  lastCheckedAt?: string;
  photo?: PropertyPhoto;
  listingUrl?: string;
  /** Derived from confirmed publication history, never from listing-provider input. */
  instagramUrl?: string;
  /** Preview records must never be represented as real for-sale listings. */
  isSample?: boolean;
};
