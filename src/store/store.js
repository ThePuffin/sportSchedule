import { atom } from 'nanostores';

let size = 5;
const year = new Date().getFullYear();
const now = new Date();
let startDate = new Date('2024-10-09');
let endDate = new Date(startDate);
endDate.setMonth(endDate.getMonth() + 1);

const endSeason =
  now > new Date(`${year} 06 30`) && now < new Date(`${year + 1} 01 01`)
    ? new Date(`${year + 1} 06 30 `)
    : new Date(`${year} 06 30 `);
endDate = endDate <= endSeason ? endDate : endSeason;

let teamsEmpty = [...Array(size)].fill(undefined);
let dateEmpty = { endSeason, beginingDate: startDate, finishingDate: endDate };

export const dateSelected = atom(dateEmpty);

export const teamSelected = atom(teamsEmpty);

export const teamsGames = atom({});
