import { Games, Teams, db } from "astro:db"
import lastAllTeamsNFL from '../temporaryData/allTeamsNFL.json'
import lastAllTeamsNHL from "../temporaryData/allTeamsNHL.json"
import lastGamesNFL from "../temporaryData/updatecurrentSeasonNFL.json"
import lastGamesNHL from "../temporaryData/updatecurrentSeasonNHL.json"

// https://astro.build/db/seed
export default async function insertTeams() {
  const allTeams = [...lastAllTeamsNHL.activeTeams, ...lastAllTeamsNFL.activeTeams]
  let lastGames = { ...lastGamesNHL, ...lastGamesNFL }

  await db.insert(Teams).values(allTeams)
  for (const [team, games] of Object.entries(lastGames)) {
    if (games.length) {
      await db.insert(Games).values(games)
    } else {
      console.log("No games found for", team)
    }
  }
}
