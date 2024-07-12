import { Games, Teams, db, eq } from 'astro:db'
import { writeJsonFile } from 'write-json-file'
import allTeamsFile from '../../temporaryData/allTeamsMLB.json'
import currentGames from '../../temporaryData/currentSeason.json'
import type { GameFormatted } from '../interface/game.ts'
import type { MLBGameAPI } from '../interface/gameMLB.ts'
import type { TeamESPN, TeamType } from '../interface/team.ts'
import { isExpiredData, readableDate } from '../utils/date.js'
import { League } from './enum.ts'
const leagueName = League.MLB
const { NODE_ENV } = process.env

export const getMLBTeams = async () => {
  try {
    const MLBTeams = await db.select().from(Teams).where(eq(Teams.league, leagueName))
    if (MLBTeams[0] && !isExpiredData(MLBTeams[0].updateDate)) {
      getMLBSchedule()
      return MLBTeams
    }
    let allTeams

    const fetchedTeams = await fetch('https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams')
    const fetchTeams: TeamESPN = await fetchedTeams.json()
    const { sports } = fetchTeams
    const { leagues } = sports[0]
    allTeams = leagues[0].teams

    const activeTeams = allTeams
      .filter(({ team }) => team.isActive)
      .sort((a, b) => (a.team.slug > b.team.slug ? 1 : -1))
      .map(({ team }) => {
        const { abbreviation, displayName, logos, nickname, id } = team
        const teamID = abbreviation

        return {
          uniqueId: `${leagueName}-${teamID}`,
          value: id,
          id: id,
          abbrev: teamID,
          label: displayName,
          teamLogo: logos[0].href,
          teamCommonName: nickname,
          conferenceName: '',
          divisionName: '',
          league: leagueName,
        }
      })

    if (NODE_ENV === 'development') {
      await writeJsonFile('./temporaryData/allTeamsMLB.json', { activeTeams })
      console.log('updated allTeamsMLB.json')
    }

    activeTeams.forEach(async (team: TeamType) => {
      const { uniqueId, ...teamData } = team

      await db
        .insert(Teams)
        .values({ ...team })
        .onConflictDoUpdate({
          target: Teams.uniqueId,
          set: {
            ...teamData,
          },
        })
    })
    getMLBSchedule()
    return activeTeams
  } catch (error) {
    console.log('Error fetching data =>', error)
    getMLBSchedule()
    return allTeamsFile.activeTeams
  }
}

export const getMLBSchedule = async () => {
  const allGames = {}
  const activeTeams: TeamType[] = await db.select().from(Teams).where(eq(Teams.league, leagueName))
  await Promise.all(
    activeTeams.map(async ({ id, abbrev }) => {
      const leagueID = `${leagueName}-${id}`
      allGames[leagueID] = await getMLBTeamSchedule(id, abbrev)
    })
  )

  if (NODE_ENV === 'development') {
    const firstKey = activeTeams[0]?.id

    const MLBgames = await db.select().from(Games).where(eq(Games.teamSelectedId, firstKey)).limit(1)

    const updateDate = (firstKey && MLBgames[0]?.updateDate) || new Date('2020-02-20')
    const expiredData = isExpiredData(updateDate)

    if (expiredData) {
      await writeJsonFile('./temporaryData/updatecurrentSeasonMLB.json', allGames)
      console.log('updated updatecurrentSeasonMLB.json')
    }
  }
  console.log('updated MLB')
  return allGames
}

const getMLBTeamSchedule = async (id: string, abbrev: string) => {
  try {
    const MLBgames = await db.select().from(Games).where(eq(Games.homeTeamShort, id))

    if (MLBgames[0]?.updateDate && isExpiredData(MLBgames[0]?.updateDate)) {
      return MLBgames
    }

    let games
    try {
      const fetchedGames = await fetch(
        ` https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/teams/${id}/schedule`
      )
      const fetchGames: MLBGameAPI = await fetchedGames.json()
      games = await fetchGames.events
    } catch (error) {
      console.log('errrroorrr', error)

      games = currentGames[id]
    }

    let gamesData = games.map((game) => {
      const { date, competitions } = game
      const { venue, competitors } = competitions[0]
      const gameDate = readableDate(new Date(date))

      const awayTeam = competitors.find((team) => team.homeAway === 'away')
      const homeTeam = competitors.find((team) => team.homeAway === 'home')

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
        teamSelectedId: id,
        show: homeTeam.team.abbreviation === abbrev,
        selectedTeam: homeTeam.team.abbreviation === abbrev,
        league: leagueName,
      }
    })

    gamesData.forEach(async (gameTeam: GameFormatted) => {
      const { uniqueId, ...gameData } = gameTeam
      await db
        .insert(Games)
        .values({ ...gameTeam })
        .onConflictDoUpdate({
          target: Games.uniqueId,
          set: {
            ...gameData,
          },
        })
    })

    return gamesData
  } catch (error) {
    console.log('Error fetching data', error)
    return {}
  }
}
