# Saved cabins

Use the heart on a property card to save or remove it. The Saved only toggle
combines with search, state, price, and sorting. Clear filters returns to the full
collection without deleting favorites. Removing the last visible favorite shows
a saved-collection empty state.

Favorites are stored as listing IDs in this browser's local storage under
`logcabinscout.savedCabins.v1`. They survive reloads and sync across tabs of the
same site. They do not sync across browsers/devices, require an account, or send
anything to a server. Clearing site data removes them. Local preview favorites
and production favorites are separate because their origins differ.

If browser storage is blocked or full, favorites still work in memory for that
visit, with a visible persistence notice. Invalid saved data is treated as empty.
IDs are not removed merely because a listing expires; Saved only shows saved
properties currently present in the active collection.

The server-rendered HTML starts without personal selections. Storage is read only
after hydration, so favorites do not enter public HTML, structured data, or the
feed. Hearts have accessible labels and pressed states, support keyboard use,
and sit outside the photo's listing link.
