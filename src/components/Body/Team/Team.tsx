import React from 'react'
import TeamCard from './Card/Card.tsx'
import Selector from './Selector/Selector.tsx'
import type { TeamType } from './interface/team.ts'

interface BodyProps {
  teamsSelectedIds: string[]
  activeTeams: TeamType[]
}

const Team: React.FC<BodyProps> = ({ teamsSelectedIds, activeTeams }) => (
  <table>
    <tbody>
      <tr>
        {teamsSelectedIds?.length === 0 || activeTeams?.length === 0 ? (
          <p>Wait for it... Please</p>
        ) : (
          teamsSelectedIds.map((teamSelectedId, i) => {
            const props = { i, activeTeams, teamsSelectedIds, teamSelectedId }

            return (
              <td key={teamSelectedId}>
                <div>
                  <Selector {...props} />
                  <TeamCard {...props} />
                </div>
              </td>
            )
          })
        )}
      </tr>
    </tbody>
  </table>
)

export default Team
