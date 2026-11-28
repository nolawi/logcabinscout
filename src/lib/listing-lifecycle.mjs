export const STATUS_FRESH_MS = 30 * 86400000;
export const saleStatus = value => ['active','pending','sold','off_market','unknown'].includes(value) ? value : 'unknown';
export function checkedTime(value,now=Date.now()) {
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value))return null;
 const date=Date.parse(value);
 return Number.isFinite(date)&&date<=now&&new Date(date).toISOString().replace('.000Z','Z')===value.replace('.000Z','Z')?date:null;
}
export function listingStatusView(row,now=Date.now()){
 const status=saleStatus(row.saleStatus??row.status??'active');
 const checked=checkedTime(row.statusCheckedAt??row.lastCheckedAt,now);
 const confirmed=status==='active'&&checked!==null&&now-checked<STATUS_FRESH_MS&&row.statusCheckOutcome!=='unconfirmed';
 const labels={sold:'Sold',pending:'Pending',off_market:'Off market',unknown:'Status unconfirmed'};
 const label=status==='active'?(confirmed?'For sale':'Status unconfirmed'):labels[status];
 const facts=checkedTime(row.lastCheckedAt,now);
 return {saleStatus:status,statusLabel:label,availabilityConfirmed:confirmed,priceIsHistorical:!confirmed||facts===null||now-facts>=STATUS_FRESH_MS,statusCheckedAt:checked===null?undefined:new Date(checked).toISOString()};
}
