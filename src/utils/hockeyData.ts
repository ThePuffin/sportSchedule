import { Games, Teams, db, eq } from 'astro:db';
import { writeJsonFile } from 'write-json-file';
import allTeamsFile from '../../temporaryData/allTeams.json';
import currentGames from '../../temporaryData/currentSeason.json';
import type { GameAPI, GameFormatted } from '../interface/game.ts';
import type { TeamNHL, TeamType } from '../interface/team.ts';
import { isExpiredData } from '../utils/date.js';
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
    let allTeams;

    const fetchedTeams = await fetch('https://api-web.nhle.com/v1/standings/now');
    const fetchTeams = await fetchedTeams.json();
    allTeams = await fetchTeams.standings;

    allTeams = allTeams.map((team: TeamNHL) => {
      if (team.teamAbbrev.default === 'ARI') {
        team.teamAbbrev.default = 'UTA';
        team.teamCommonName.default = 'Utah';
      }
      return team;
    });
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
        };
      });
    if (NODE_ENV === 'development') {
      await writeJsonFile('./temporaryData/allTeams.json', { activeTeams });
      console.log('updated allTeams.json');
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
    getNhlSchedule();
    return allTeamsFile.activeTeams;
  }
};

export const getNhlSchedule = async () => {
  const allGames = {};
  const activeTeams: TeamType[] = await db.select().from(Teams).where(eq(Teams.league, leagueName));
  await Promise.all(
    activeTeams.map(async ({ id }) => {
      allGames[id] = await getNhlTeamSchedule(id);
    })
  );

  if (NODE_ENV === 'development') {
    const firstKey = activeTeams[0]?.id;
    const NHLgames = await db.select().from(Games).where(eq(Games.homeTeamShort, firstKey)).limit(1);

    const updateDate = (firstKey && NHLgames[0]?.updateDate) || new Date('2020-02-20');
    const expiredData = isExpiredData(updateDate);

    if (expiredData) {
      await writeJsonFile('./temporaryData/updatecurrentSeason.json', allGames);
      console.log('updated updatecurrentSeason.json');
    }
  }
  console.log('updated');
  return allGames;
};

const getNhlTeamSchedule = async (id: string) => {
  try {
    const NHLgames = await db.select().from(Games).where(eq(Games.homeTeamShort, id));

    if (NHLgames[0]?.updateDate && isExpiredData(NHLgames[0]?.updateDate)) {
      return NHLgames;
    }

    let games;
    try {
      const fetchedGames = await fetch(`https://api-web.nhle.com/v1/club-schedule-season/${id}/now`);
      const fetchGames = await fetchedGames.json();
      games = await fetchGames.games;
    } catch (error) {
      games = currentGames[id];
    }

    let gamesData: GameFormatted[] = games.map((game: GameAPI) => {
      return {
        uniqueId: `${leagueName}.${id}.${game.gameDate}`,
        awayTeamId: game.awayTeam.abbrev,
        awayTeamShort: game.awayTeam.abbrev,
        homeTeamId: game.homeTeam.abbrev,
        homeTeamShort: game.homeTeam.abbrev,
        arenaName: game.venue?.default || '',
        gameDate: game.gameDate,
        teamSelectedId: id,
        show: game.homeTeam.abbrev === id,
        selectedTeam: game.homeTeam.abbrev === id,
        league: leagueName,
      };
    });

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
