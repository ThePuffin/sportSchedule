import { atom } from 'nanostores';

let size = 5;
let startDate = new Date();
let endDate = new Date(startDate);
endDate.setMonth(endDate.getMonth() + 1);


let maxSelectable = new Date();
maxSelectable.setFullYear(maxSelectable.getFullYear() + 1);

let teamsEmpty = [...Array(size)].fill(undefined);
let dateEmpty = { maxSelectable, beginingDate: startDate, finishingDate: endDate };
let gamesSelectedEmpty = [];

export const dateSelected = atom(dateEmpty);

export const teamSelected = atom(teamsEmpty);

export const teamsGames = atom({});

export const gamesSelected = atom(gamesSelectedEmpty);
