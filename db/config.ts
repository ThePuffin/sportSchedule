import { column, defineDb, defineTable } from "astro:db";
const now = new Date();

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
    updateDate: column.date({ default: now }),
  },
});

export const Games = defineTable({
  columns: {
    uniqueId: column.text({ primaryKey: true }),
    awayTeamId: column.text(),
    awayTeamShort: column.text(),
    homeTeamId: column.text(),
    homeTeamShort: column.text(),
    arenaName: column.text(),
    gameDate: column.text(),
    teamSelectedId: column.text(),
    show: column.boolean(),
    selectedTeam: column.boolean({ default: false }),
    league: column.text(),
    updateDate: column.date({ default: now }),
  },
});

// https://astro.build/db/config
export default defineDb({
  tables: { Teams, Games },
});
