import { stateForWeek, STATES } from './lib/discovery-schedule.mjs';
const chosen = process.env.RENTCAST_STATE?.trim().toUpperCase();
const state = chosen || stateForWeek();
if (!STATES.includes(state)) throw new Error('Use a valid two-letter US state abbreviation');
console.log(state);
