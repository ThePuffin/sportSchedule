import { atom } from 'nanostores';

// Teams selected
let size = 6;
const storedSelectedTeams = typeof window !== 'undefined' && window.localStorage && localStorage.getItem('teamsSelected') ? localStorage.getItem('teamsSelected').split(';') : [...Array(size)].fill(undefined);

// Date selected
const now = new Date();
const oneMonthMore = new Date().setMonth(now.getMonth() + 1);
const storedStartDate = typeof window !== 'undefined' && window.localStorage && localStorage.getItem('startDate') ? localStorage.getItem('startDate') : now;
const storedEndDate = typeof window !== 'undefined' && window.localStorage && localStorage.getItem('startDate') ? localStorage.getItem('endDate') : oneMonthMore;
let startDate = new Date(storedStartDate);
let endDate = new Date(storedEndDate);
let maxSelectable = new Date();
maxSelectable.setFullYear(maxSelectable.getFullYear() + 1);
let dateEmpty = { maxSelectable, beginingDate: startDate, finishingDate: endDate };

// Game selected
let gamesSelectedEmpty = typeof window !== 'undefined' && window.localStorage && localStorage.getItem('gameSelected') ? localStorage.getItem('gameSelected').split(';').map(game => JSON.parse(game)) : [];

export const dateSelected = atom(dateEmpty);

export const teamSelected = atom(storedSelectedTeams);

export const teamsGames = atom({});

export const gamesSelected = atom(gamesSelectedEmpty);
