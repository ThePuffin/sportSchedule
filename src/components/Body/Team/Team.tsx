import { useEffect, useState } from "react";
import type { TeamBodyProps } from "../../../interface/card.ts";
import { teamSelected } from "../../../store/store.js";
import TeamCard from "./Cards/Cards.tsx";
import Selector from "./Selector/Selector.tsx";

export default function Team(astroProps) {
  const [teamsSelected, setTeamsSelected] = useState([]);
  const { activeTeams, teamsSelectedIds, teamsGames }: TeamBodyProps =
    astroProps;
  const isStoredSelectedTeams = !!teamSelected
    .get()
    ?.filter((team) => team !== undefined).length;
  if (!isStoredSelectedTeams) {
    teamSelected.set(teamsSelectedIds);
  }

  useEffect(() => {
    teamSelected.subscribe(async (value: string[]) => {
      setTeamsSelected([...value]);
    });
  }, []);

  return (
    <table style={{ tableLayout: "fixed", width: "100%" }}>
      <tbody>
        <tr>
          {teamsSelected?.length === 0 || activeTeams?.length === 0 ? (
            <p>Wait for it... Please</p>
          ) : (
            teamsSelected.map((teamSelectedId, i) => {
              const props = {
                i,
                activeTeams,
                teamsSelected,
                teamSelectedId,
                teamsGames,
              };
              const keyCard = `${i}${teamSelectedId}`;
              const keySelector = `${teamSelectedId}${i}`;
              const width = 100 / teamsSelected.length;
              return (
                <td
                  key={teamSelectedId}
                  style={{ width: `${width}%`, height: "100%" }}
                >
                  <div>
                    <Selector key={keySelector} {...props} />
                    <TeamCard key={keyCard} id={i} {...props} />
                  </div>
                </td>
              );
            })
          )}
        </tr>
      </tbody>
    </table>
  );
}
