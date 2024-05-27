import { atom } from 'nanostores';

let size = 5;
let teamsEmpty = [...Array(size)].fill(undefined);

export const teamSelected = atom(teamsEmpty);

export const teamsSelectedId = atom([]);
