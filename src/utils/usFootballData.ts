import { Games, Teams, db, eq } from 'astro:db'
import { writeJsonFile } from 'write-json-file'
import allTeamsFile from '../../temporaryData/allTeamsNFL.json'
import currentGames from '../../temporaryData/currentSeason.json'
import type { GameFormatted } from '../interface/game.ts'
import type { NFLGameAPI } from '../interface/gameNFL.ts'
import type { TeamNFL, TeamType } from '../interface/team.ts'
import { isExpiredData, readableDate } from '../utils/date.js'
import { League } from './enum.ts'
const leagueName = League.NFL
const { NODE_ENV } = process.env

export const getNFLTeams = async () => {
  try {
    const NFLTeams = await db.select().from(Teams).where(eq(Teams.league, leagueName))
    if (NFLTeams[0] && !isExpiredData(NFLTeams[0].updateDate)) {
      getNFLSchedule()
      return NFLTeams
    }
    let allTeams

    const fetchedTeams = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams')
    const fetchTeams = await fetchedTeams.json()
    const { sports } = await fetchTeams
    const { leagues } = sports[0]
    allTeams = leagues[0].teams

    // console.log(allTeams.map(({ team }) => {
    //   const idd = `${leagueName}-${team.id}`
    //   return {
    //     team: idd,
    //     'color': team.color,
    //     'background-color': team.alternateColor
    //   }
    // }))

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
      await writeJsonFile('./temporaryData/allTeamsNFL.json', { activeTeams })
      console.log('updated allTeamsNFL.json')
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
    getNFLSchedule()
    return activeTeams
  } catch (error) {
    console.log('Error fetching data =>', error)
    getNFLSchedule()
    return allTeamsFile.activeTeams
  }
}

export const getNFLSchedule = async () => {
  const allGames = {}
  const activeTeams: TeamType[] = await db.select().from(Teams).where(eq(Teams.league, leagueName))
  await Promise.all(
    activeTeams.map(async ({ id, abbrev }) => {
      allGames[id] = await getNFLTeamSchedule(id, abbrev)
    })
  )

  if (NODE_ENV === 'development') {
    const firstKey = activeTeams[0]?.id

    const NFLgames = await db.select().from(Games).where(eq(Games.teamSelectedId, firstKey)).limit(1)

    const updateDate = (firstKey && NFLgames[0]?.updateDate) || new Date('2020-02-20')
    const expiredData = isExpiredData(updateDate)

    if (expiredData) {
      await writeJsonFile('./temporaryData/updatecurrentSeasonNFL.json', allGames)
      console.log('updated updatecurrentSeasonNFL.json')
    }
  }
  console.log('updated NFL')
  return allGames
}

const getNFLTeamSchedule = async (id: string, abbrev: string) => {
  try {
    const NFLgames = await db.select().from(Games).where(eq(Games.homeTeamShort, id))

    if (NFLgames[0]?.updateDate && isExpiredData(NFLgames[0]?.updateDate)) {
      return NFLgames
    }

    let games
    try {
      const fetchedGames = await fetch(
        ` https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${id}/schedule`
      )
      const fetchGames: NFLGameAPI = await fetchedGames.json()
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
        teamSelectedId: abbrev,
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
