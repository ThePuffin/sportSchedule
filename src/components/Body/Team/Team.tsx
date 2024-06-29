import React from "react";
import type { TeamType } from "../../../interface/team.ts";
import TeamCard from "./Card/Card.tsx";
import Selector from "./Selector/Selector.tsx";

interface BodyProps {
  teamsSelectedIds: string[];
  activeTeams: TeamType[];
}

const Team: React.FC<BodyProps> = ({ teamsSelectedIds, activeTeams }) => (
  <table style={{ tableLayout: "fixed", width: "100%" }}>
    <tbody>
      <tr>
        {teamsSelectedIds?.length === 0 || activeTeams?.length === 0 ? (
          <p>Wait for it... Please</p>
        ) : (
          teamsSelectedIds.map((teamSelectedId, i) => {
            const props = { i, activeTeams, teamsSelectedIds, teamSelectedId };
            const width = 100 / teamsSelectedIds.length;
            return (
              <td
                key={teamSelectedId}
                style={{ width: `${width}%`, height: "100%" }}
              >
                <div>
                  <Selector {...props} />
                  <TeamCard id={i} {...props} />
                </div>
              </td>
            );
          })
        )}
      </tr>
    </tbody>
  </table>
);

export default Team;
