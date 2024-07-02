import { Games, Teams, db } from 'astro:db'
import lastAllTeams from '../temporaryData/allTeams.json'
import lastGames from '../temporaryData/updatecurrentSeason.json'

// https://astro.build/db/seed
export default async function insertTeams() {
  await db.insert(Teams).values(lastAllTeams.activeTeams)
  for (const [team, games] of Object.entries(lastGames)) {
    if (games.length) {
      await db.insert(Games).values(games)
    } else {
      console.log('No games found for', team)
    }
  }
}
