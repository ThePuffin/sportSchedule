import { db, Teams } from 'astro:db'
import { writeJsonFile } from 'write-json-file'
import type { TeamNHL, TeamType } from "../interface/team"
const league = 'NHL'

export const getNhlTeams = async () => {
    try {
        const fetchedTeams = await fetch('https://api-web.nhle.com/v1/standings/now')
        const fetchTeams = await fetchedTeams.json()
        const allTeams = await fetchTeams.standings

        const activeTeams = allTeams
            .sort((a: TeamNHL, b: TeamNHL) => (a.placeName?.default > b.placeName?.default ? 1 : -1))
            .map((team: TeamNHL) => {
                const { teamAbbrev, teamName, teamLogo, divisionName, teamCommonName, conferenceName } = team
                const teamID = teamAbbrev.default
                return {
                    uniqueId: `${league}-${teamID}`,
                    value: teamID,
                    id: teamID,
                    label: teamName?.default,
                    teamLogo: teamLogo,
                    teamCommonName: teamCommonName.default,
                    conferenceName,
                    divisionName,
                    league: league,
                }
            })
        // TODO: find a way to get data somewhere online
        await writeJsonFile('./temporaryData/allTeams.json', { activeTeams })
        activeTeams.forEach(async (team: TeamType) => {
            const { uniqueId, ...teamData } = team
            await db
                .insert(Teams)
                .values({ ...team })
                .onConflictDoUpdate({
                    target: Teams.uniqueId,
                    set: {
                        ...teamData
                    },
                })
        })
        getNhlSchedule()
        return activeTeams

    } catch (error) {
        console.log('Error fetching data =>', error)
    }
}

export const getNhlSchedule = async () => {
    const allGames = {}
    const activeTeams: TeamType[] = await db.select().from(Teams)
    await Promise.all(
        activeTeams.map(async ({ id }) => {
            allGames[id] = await getNhlTeamSchedule(id)
        })
    )
    await writeJsonFile('./temporaryData/currentSeason.json', allGames)
    console.log('updated')
    return allGames
}

const getNhlTeamSchedule = async (id: string) => {
    try {
        const fetchedGames = await fetch(`https://api-web.nhle.com/v1/club-schedule-season/${id}/now`)
        const fetchGames = await fetchedGames.json()
        const games = await fetchGames.games
        return games
    } catch (error) {
        console.log('Error fetching data', error)
        return {}

    }
}
