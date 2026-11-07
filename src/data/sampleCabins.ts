import type { Cabin } from '../types/cabin';

/** Illustrative data only — prices and properties are fictional. */
export const sampleCabins: Cabin[] = [
  { id: 'sample-va', title: 'Blue Ridge Retreat', location: 'Virginia', price: 389000, acreage: 4.6, propertyType: 'Log home', isSample: true },
  { id: 'sample-nc', title: 'Pine Ridge Cabin', location: 'North Carolina', price: 465000, acreage: 2.8, propertyType: 'Log home', isSample: true },
  { id: 'sample-tn', title: 'Mountain Timber Home', location: 'Tennessee', price: 525000, acreage: 6.2, propertyType: 'Log home', isSample: true },
];
