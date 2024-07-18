import { Games, Teams, db } from "astro:db";
import lastAllTeamsMLB from "../temporaryData/allTeamsMLB.json";
import lastAllTeamsNBA from "../temporaryData/allTeamsNBA.json";
import lastAllTeamsNFL from "../temporaryData/allTeamsNFL.json";
import lastAllTeamsNHL from "../temporaryData/allTeamsNHL.json";
import lastGamesMLB from "../temporaryData/updatecurrentSeasonMLB.json";
import lastGamesNBA from "../temporaryData/updatecurrentSeasonNBA.json";
import lastGamesNFL from "../temporaryData/updatecurrentSeasonNFL.json";
import lastGamesNHL from "../temporaryData/updatecurrentSeasonNHL.json";

// https://astro.build/db/seed
export default async function insertTeams() {
  const allTeams = [
    ...lastAllTeamsNHL.activeTeams,
    ...lastAllTeamsNFL.activeTeams,
    ...lastAllTeamsNBA.activeTeams,
    ...lastAllTeamsMLB.activeTeams,
  ];

  const lastGames = {
    ...lastGamesNHL,
    ...lastGamesNFL,
    ...lastGamesNBA,
    ...lastGamesMLB,
  };

  await db.insert(Teams).values(allTeams);
  for (const [team, games] of Object.entries(lastGames)) {
    if (games.length) {
      await db.insert(Games).values(games);
    } else {
      console.log("No games found for", team);
    }
  }
}
