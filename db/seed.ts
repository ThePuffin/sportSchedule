import { db, Teams } from 'astro:db';
import lastAllTeams from '../temporaryData/allTeams.json';

// https://astro.build/db/seed
export default async function insertTeams() {
  await db.insert(Teams).values(lastAllTeams.activeTeams);
}
