import { isExpiredData } from '../utils/date.js';
import { db, Teams, Games, eq } from 'astro:db';
import { writeJsonFile } from 'write-json-file';
import allTeamsFile from '../../temporaryData/allTeams.json';
import type { GameAPI, GameFormatted } from '../interface/game.ts';
import type { TeamNHL, TeamType } from '../interface/team.ts';
import { League } from './enum.ts';
const leagueName = League.NHL;
const { NODE_ENV } = process.env;

export const getNhlTeams = async () => {
  try {
    const nhlTeams = await db.select().from(Teams).where(eq(Teams.league, leagueName));
    if (nhlTeams[0] && !isExpiredData(nhlTeams[0].updateDate)) {
      getNhlSchedule();
      return nhlTeams;
    }
    const fetchedTeams = await fetch('https://api-web.nhle.com/v1/standings/now');
    const fetchTeams = await fetchedTeams.json();
    const allTeams = await fetchTeams.standings;

    const activeTeams = allTeams
      .sort((a: TeamNHL, b: TeamNHL) => (a.placeName?.default > b.placeName?.default ? 1 : -1))
      .map((team: TeamNHL) => {
        const { teamAbbrev, teamName, teamLogo, divisionName, teamCommonName, conferenceName } = team;
        const teamID = teamAbbrev.default;
        return {
          uniqueId: `${leagueName}-${teamID}`,
          value: teamID,
          id: teamID,
          label: teamName?.default,
          teamLogo: teamLogo,
          teamCommonName: teamCommonName.default,
          conferenceName,
          divisionName,
          league: leagueName,
          updateDate: new Date().toISOString(),
        };
      });
    if (NODE_ENV === 'development') {
      await writeJsonFile('./temporaryData/allTeams.json', { activeTeams });
    }
    activeTeams.forEach(async (team: TeamType) => {
      const { uniqueId, ...teamData } = team;
      await db
        .insert(Teams)
        .values({ ...team })
        .onConflictDoUpdate({
          target: Teams.uniqueId,
          set: {
            ...teamData,
          },
        });
    });
    getNhlSchedule();
    return activeTeams;
  } catch (error) {
    console.log('Error fetching data =>', error);
    return allTeamsFile.activeTeams;
  }
};

export const getNhlSchedule = async () => {
  const allGames = {};
  const activeTeams: TeamType[] = await db.select().from(Teams);
  await Promise.all(
    activeTeams.map(async ({ id }) => {
      allGames[id] = await getNhlTeamSchedule(id);
    })
  );
  // if (NODE_ENV === 'development') {
  //   const firstKey = Object.keys(allGames)[0];
  //   if (isExpiredData(allGames[firstKey].updateDate)) {
  //     await writeJsonFile('./temporaryData/updatecurrentSeason.json', allGames);
  //   }
  // }
  console.log('updated');
  return allGames;
};

const getNhlTeamSchedule = async (id: string) => {
  try {
    const NHLgames = await db.select().from(Games).where(eq(Games.selectedTeam, id));
    console.log(' NHLgames ', NHLgames[0], id);

    if (NHLgames[0]?.updateDate && !isExpiredData(NHLgames[0]?.updateDate)) {
      return NHLgames;
    }

    const fetchedGames = await fetch(`https://api-web.nhle.com/v1/club-schedule-season/${id}/now`);
    const fetchGames = await fetchedGames.json();
    const games = await fetchGames.games;
    let gamesData: GameFormatted[] = games.map((game: GameAPI) => {
      return {
        uniqueId: `${leagueName}${game.homeTeam.abbrev}${game.gameDate}`,
        awayTeamId: game.awayTeam.abbrev,
        awayTeamShort: game.awayTeam.abbrev,
        homeTeamId: game.homeTeam.abbrev,
        homeTeamShort: game.homeTeam.abbrev,
        arenaName: game.venue?.default || '',
        gameDate: game.gameDate,
        teamSelectedId: id,
        updateDate: new Date(game.gameDate).getTime(),
        show: game.homeTeam.abbrev === id,
        selectedTeam: game.homeTeam.abbrev === id,
        league: leagueName,
      };
    });

    gamesData = [...new Set(gamesData.map((obj) => obj.uniqueId))].map((uniqueId) =>
      gamesData.find((obj) => obj.uniqueId === uniqueId)
    );

    gamesData.forEach(async (gameTeam: GameFormatted) => {
      const { uniqueId, ...gameData } = gameTeam;
      await db
        .insert(Games)
        .values({ ...gameTeam })
        .onConflictDoUpdate({
          target: Games.uniqueId,
          set: {
            ...gameData,
          },
        });
    });

    return gamesData;
  } catch (error) {
    console.log('Error fetching data', error);
    return {};
  }
};
