import { stateForWeek } from './lib/discovery-schedule.mjs';
const chosen = process.env.RENTCAST_STATE?.trim().toUpperCase();
const state = chosen || stateForWeek();
if (!/^[A-Z]{2}$/.test(state)) throw new Error('Invalid state format');
console.log(state);
