import { db, Teams, Games } from 'astro:db';
import lastAllTeams from '../temporaryData/allTeams.json';

const games = {
  uniqueId: 'test',
  awayTeamId: 'test',
  awayTeamShort: 'test',
  homeTeamId: 'test',
  homeTeamShort: 'test',
  arenaName: 'test',
  gameDate: 'test',
  teamSelectedId: 'test',
  timestampDate: 'test',
  show: true,
  selectedTeam: 'test',
  league: 'test',
};

// https://astro.build/db/seed
export default async function insertTeams() {
    await db.insert(Teams).values(lastAllTeams.activeTeams);
//   await db.insert(Games).values(games);

  //   const Teamss = await db.select().from(Teams);
  //   console.log({ Teamss });
//   const gameess = await db.select().from(Games);
//   console.log({ gameess });
}
