import { column, defineDb, defineTable } from 'astro:db'

export const Teams = defineTable({
	columns: {
		uniqueId: column.text({ primaryKey: true }),
		value: column.text(),
		id: column.text(),
		label: column.text(),
		teamLogo: column.text(),
		teamCommonName: column.text(),
		conferenceName: column.text(),
		divisionName: column.text(),
		league: column.text(),
	}
})

// const NhlSchedule = defineTable({
//   columns: 	{
// 			id: column.number(),
// 			season: column.number(),
// 			gameType: column.number(),
// 			gameDate: column.text(),
// 			venue: {
// 				default: column.text(),
// 			},
// 			neutralSite: column.boolean(),
// 			startTimeUTC: column.text(),
// 			easternUTCOffset: column.text(),
// 			venueUTCOffset: column.text(),
// 			venueTimezone: column.text(),
// 			gameState: column.text(),
// 			gameScheduleState: column.text(),
// 			tvBroadcasts: [],
// 			awayTeam: {
// 				id: column.number(),
// 				placeName: {
// 					default: column.text(),
// 				},
// 				abbrev: column.text(),
// 				logo: column.text(),
// 				darkLogo: column.text(),
// 				awaySplitSquad: column.boolean(),
// 				score: column.number(),
// 			},
// 			homeTeam: {
// 				id: column.number(),
// 				placeName: {
// 					default: column.text(),
// 				},
// 				abbrev: column.text(),
// 				logo: column.text(),
// 				darkLogo: column.text(),
// 				homeSplitSquad: column.boolean(),
// 				hotelLink: column.text(),
// 				hotelDesc: column.text(),
// 				score: column.number(),
// 			},
// 			periodDescriptor: {
// 				periodType: column.text(),
// 				maxRegulationPeriods: column.number(),
// 			},
// 			gameOutcome: {
// 				lastPeriodType: column.text(),
// 			},
// 			winningGoalie: {
// 				playerId: column.number(),
// 				firstInitial: {
// 					default: column.text(),
// 				},
// 				lastName: {
// 					default: column.text(),
// 				}
// 			},
// 			winningGoalScorer: {
// 				playerId: column.number(),
// 				firstInitial: {
// 					default: column.text(),
// 				},
// 				lastName: {
// 					default: column.text(),
// 				}
// 			},
// 			gameCenterLink: column.text(),
// 		}
// })

// https://astro.build/db/config
export default defineDb({
	tables: { Teams }
});


