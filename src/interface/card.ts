import type { GameFormatted } from "./game"
import type { TeamType } from "./team"

export interface PropsCards {
  i: number
  activeTeams: TeamType[]
  id: number
  teamsSelectedIds: string[]
  teamSelectedId: string
}


export interface PropsCard {
  game: GameFormatted
}