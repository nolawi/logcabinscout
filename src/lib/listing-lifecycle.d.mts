export const STATUS_FRESH_MS: number;
export function saleStatus(value: unknown): 'active'|'pending'|'sold'|'off_market'|'unknown';
export function checkedTime(value: unknown,now?:number):number|null;
export function listingStatusView(row:{saleStatus?:unknown;status?:unknown;statusCheckedAt?:unknown;lastCheckedAt?:unknown;statusCheckOutcome?:unknown},now?:number):{saleStatus:'active'|'pending'|'sold'|'off_market'|'unknown';statusLabel:string;availabilityConfirmed:boolean;priceIsHistorical:boolean;statusCheckedAt?:string};
