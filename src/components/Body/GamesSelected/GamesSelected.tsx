import { useEffect, useState } from "react";
import type { GameFormatted } from "../../../interface/game.ts";
import {
  dateSelected,
  gamesSelected,
  teamSelected,
} from "../../../store/store.js";
import TeamCard from "../TeamCard/TeamCard.tsx";

const GamesSelected = () => {
  const [games, setGames] = useState([]);
  const [teamsSelected, setTeamsSelected] = useState(teamSelected.get());

  useEffect(() => {
    gamesSelected.subscribe(async (newGames: GameFormatted[]) => {
      setGames(newGames);
    });
    teamSelected.subscribe(async (value: string[]) => {
      setTeamsSelected([...value]);
      const selectedGames = gamesSelected.get();

      const newSelectedGames =
        selectedGames?.filter((game: GameFormatted) =>
          value.includes(game.teamSelectedId),
        ) ?? [];

      setGames(newSelectedGames);
      gamesSelected.set(newSelectedGames);
      localStorage.setItem(
        "gameSelected",
        newSelectedGames.map((game) => JSON.stringify(game)).join(";"),
      );
    });

    dateSelected.subscribe(({ beginingDate, finishingDate }) => {
      const selectedGames = gamesSelected.get();
      // fix it
      const newSelectedGames =
        selectedGames?.filter(
          (game: GameFormatted) =>
            beginingDate <= new Date(game.gameDate) &&
            new Date(game.gameDate) <= finishingDate,
        ) ?? [];

      setGames(newSelectedGames);
      gamesSelected.set(newSelectedGames);
      localStorage.setItem(
        "gameSelected",
        newSelectedGames.map((game) => JSON.stringify(game)).join(";"),
      );
    });
  }, []);

  if (games.length) {
    return (
      <div>
        <table style={{ tableLayout: "fixed", width: "100%" }}>
          <tbody>
            <tr>
              {games.map((game) => {
                return (
                  <td key={game.uniqueId}>
                    <TeamCard game={game} isSelected={false} />
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    );
  } else {
    return <div></div>;
  }
};

export default GamesSelected;
