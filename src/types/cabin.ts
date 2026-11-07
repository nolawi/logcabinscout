/** Listing shape shared by cards and future data providers. */
export type Cabin = {
  id: string;
  title: string;
  location: string;
  price: number;
  acreage: number | null;
  propertyType: string;
  lastCheckedAt?: string;
  imageUrl?: string;
  listingUrl?: string;
  /** Preview records must never be represented as real for-sale listings. */
  isSample?: boolean;
};
