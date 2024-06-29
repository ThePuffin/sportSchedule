import type { TeamType } from "./team"

export interface PropsCard {
  i: number
  activeTeams: TeamType[]
  id: number
  teamsSelectedIds: string[]
  teamSelectedId: string
}
