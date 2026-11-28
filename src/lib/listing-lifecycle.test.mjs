import test from'node:test';import assert from'node:assert/strict';import{listingStatusView,STATUS_FRESH_MS}from'./listing-lifecycle.mjs';
const checked='2026-10-01T00:00:00Z',stamp=Date.parse(checked);
test('status freshness changes labels without converting age into a sale',()=>{
 const before=listingStatusView({lastCheckedAt:checked},stamp+STATUS_FRESH_MS-1);assert.equal(before.availabilityConfirmed,true);
 const after=listingStatusView({lastCheckedAt:checked},stamp+STATUS_FRESH_MS);assert.equal(after.saleStatus,'active');assert.equal(after.statusLabel,'Status unconfirmed');assert.equal(after.availabilityConfirmed,false);assert.equal(after.priceIsHistorical,true);
});
test('sold and pending remain explicit historical labels and prices never become sale prices',()=>{
 for(const[saleStatus,label]of[['sold','Sold'],['pending','Pending'],['off_market','Off market']]){const v=listingStatusView({saleStatus,lastCheckedAt:checked},stamp+365*86400000);assert.equal(v.statusLabel,label);assert.equal(v.priceIsHistorical,true);assert.equal(v.availabilityConfirmed,false);}
});
test('status-only checks do not imply fresh price facts and failed checks do not imply availability',()=>{
 const now=stamp+90*86400000;const fresh=new Date(now).toISOString();const row={saleStatus:'active',lastCheckedAt:checked,statusCheckedAt:fresh};assert.equal(listingStatusView(row,now).availabilityConfirmed,true);assert.equal(listingStatusView(row,now).priceIsHistorical,true);assert.equal(listingStatusView({...row,statusCheckOutcome:'unconfirmed'},now).availabilityConfirmed,false);
 for(const statusCheckedAt of ['bad','2027-01-01T00:00:00Z','2026-02-30T00:00:00Z'])assert.equal(listingStatusView({...row,statusCheckedAt},now).availabilityConfirmed,false);
});
