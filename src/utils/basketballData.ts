import { Games, Teams, db, eq } from 'astro:db';
import { writeJsonFile } from 'write-json-file';
import allTeamsFile from '../../temporaryData/allTeamsNBA.json';
import currentGames from '../../temporaryData/currentSeason.json';
import type { GameFormatted } from '../interface/game.ts';
import type { NBAGameAPI } from '../interface/gameNBA.ts';
import type { TeamESPN, TeamType } from '../interface/team.ts';
import { isExpiredData, readableDate } from '../utils/date.js';
import { League } from './enum.ts';
const leagueName = League.NBA;
const { NODE_ENV } = process.env;

export const getNBATeams = async () => {
  try {
    const NBATeams = await db.select().from(Teams).where(eq(Teams.league, leagueName));
    if (NBATeams[0] && !isExpiredData(NBATeams[0]?.updateDate)) {
      getNBASchedule();
      return NBATeams;
    }
    let allTeams;

    const fetchedTeams = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams');
    const fetchTeams: TeamESPN = await fetchedTeams.json();
    const { sports } = fetchTeams;
    const { leagues } = sports[0];
    allTeams = leagues[0].teams;

    const activeTeams = allTeams
      .filter(({ team }) => team.isActive)
      .sort((a, b) => (a.team.slug > b.team.slug ? 1 : -1))
      .map(({ team }) => {
        const { abbreviation, displayName, logos, nickname, id } = team;
        const teamID = abbreviation;
        const uniqueId = `${leagueName}-${teamID}`;
        return {
          uniqueId,
          value: uniqueId,
          id: id,
          abbrev: teamID,
          label: displayName,
          teamLogo: logos[0].href,
          teamCommonName: nickname,
          conferenceName: '',
          divisionName: '',
          league: leagueName,
        };
      });

    if (NODE_ENV === 'development') {
      await writeJsonFile('./temporaryData/allTeamsNBA.json', { activeTeams });
      console.log('updated allTeamsNBA.json');
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
    getNBASchedule();
    return activeTeams;
  } catch (error) {
    console.log('Error fetching data =>', error);
    getNBASchedule();
    return allTeamsFile.activeTeams;
  }
};

export const getNBASchedule = async () => {
  const allGames = {};
  const activeTeams: TeamType[] = await db.select().from(Teams).where(eq(Teams.league, leagueName));
  await Promise.all(
    activeTeams.map(async ({ id, abbrev, value }) => {
      const leagueID = `${leagueName}-${id}`;
      allGames[leagueID] = await getNBATeamSchedule({ id, value, abbrev });
    })
  );

  if (NODE_ENV === 'development') {
    const firstKey = activeTeams[0]?.id;

    const NBAgames = await db.select().from(Games).where(eq(Games.teamSelectedId, firstKey)).limit(1);

    const updateDate = (firstKey && NBAgames[0]?.updateDate) || new Date('2020-02-20');
    const expiredData = isExpiredData(updateDate);

    if (expiredData) {
    await writeJsonFile('./temporaryData/updatecurrentSeasonNBA.json', allGames);
    console.log('updated updatecurrentSeasonNBA.json');
    }
  }
  console.log('updated NBA');
  return allGames;
};

const getNBATeamSchedule = async ({ id, value, abbrev }) => {
  try {
    const NBAgames = await db.select().from(Games).where(eq(Games.homeTeamShort, id));

    if (NBAgames[0]?.updateDate && isExpiredData(NBAgames[0]?.updateDate)) {
      return NBAgames;
    }

    let games;
    try {
      const fetchedGames = await fetch(
        ` https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${id}/schedule`
      );
      const fetchGames: NBAGameAPI = await fetchedGames.json();
      games = fetchGames.events;
      console.log('yes', value);
    } catch (error) {
      console.log('no', value);
      console.log('errrroorrr', error);

      games = currentGames[id];
    }

    let gamesData = games.map((game) => {
      const { date, competitions } = game;
      const { venue, competitors } = competitions[0];
      const gameDate = readableDate(new Date(date));

      const awayTeam = competitors.find((team) => team.homeAway === 'away');
      const homeTeam = competitors.find((team) => team.homeAway === 'home');

      return {
        uniqueId: `${leagueName}.${id}.${gameDate}`,
        arenaName: venue?.fullName || '',
        awayTeamId: awayTeam.team.abbreviation,
        awayTeam: awayTeam.team.displayName,
        awayTeamShort: awayTeam.team.abbreviation,
        homeTeam: homeTeam.team.displayName,
        homeTeamId: homeTeam.team.abbreviation,
        homeTeamShort: homeTeam.team.abbreviation,
        gameDate: gameDate,
        teamSelectedId: value,
        show: homeTeam.team.abbreviation === abbrev,
        selectedTeam: homeTeam.team.abbreviation === abbrev,
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
