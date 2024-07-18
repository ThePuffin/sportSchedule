import { useState } from "react";
import TeamDataMLB from "../../../../temporaryData/allTeamsMLB.json";
import TeamDataNBA from "../../../../temporaryData/allTeamsNBA.json";
import TeamDataNFL from "../../../../temporaryData/allTeamsNFL.json";
import TeamDataNHL from "../../../../temporaryData/allTeamsNHL.json";

import type { PropsCard } from "../../../interface/card.js";
import type { GameFormatted } from "../../../interface/game.js";
import { gamesSelected } from "../../../store/store.js";
import "./TeamCard.css";
import "./colorsTeam.css";

const TeamCard = (props: PropsCard) => {
  const [game, setGame] = useState(props.game);

  const onClick = async (card) => {
    let selectedGamesCopy: GameFormatted[] = [];
    selectedGamesCopy = gamesSelected.get();

    const alreadySelected = selectedGamesCopy.find(
      (selectedGame) => selectedGame.uniqueId === card.uniqueId,
    );
    selectedGamesCopy = selectedGamesCopy.filter(
      (selectedGame) =>
        selectedGame.gameDate !== card.gameDate &&
        selectedGame.teamSelectedId !== card.teamSelectedId,
    );

    if (!alreadySelected) {
      selectedGamesCopy.push(card);
      selectedGamesCopy.sort(
        (a, b) =>
          new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime(),
      );
    }

    // Save the selected games in local storage
    localStorage.setItem(
      "gameSelected",
      selectedGamesCopy.map((game) => JSON.stringify(game)).join(";"),
    );

    gamesSelected.set(selectedGamesCopy);
    setGame(card);
  };

  const {
    arenaName,
    league,
    awayTeamId,
    show,
    selectedTeam,
    homeTeamId,
    gameDate,
    awayTeamShort,
    homeTeamShort,
    awayTeam,
    homeTeam,
    teamSelectedId,
    venueTimezone,
    timeStart,
  } = game;
  let homeTeamLogo;
  let awayTeamLogo;
  const visibleDate = new Date(gameDate).toLocaleDateString();
  const timeZone = venueTimezone
    ? `(${venueTimezone?.replace("/", " / ").replace("_", " ")})`
    : "";

  const activeTeams = [
    ...TeamDataNHL.activeTeams,
    ...TeamDataNFL.activeTeams,
    ...TeamDataNBA.activeTeams,
    ...TeamDataMLB.activeTeams,
  ];
  const homeTeamUniqueId = league + "-" + homeTeamId;
  const awayTeamUniqueId = league + "-" + awayTeamId;

  homeTeamLogo = activeTeams.find((team) =>
    team.uniqueId.includes(homeTeamUniqueId),
  )?.teamLogo;
  awayTeamLogo = activeTeams.find((team) =>
    team.uniqueId.includes(awayTeamUniqueId),
  )?.teamLogo;

  const hideDate = false;

  const homeOrAway = selectedTeam ? `card t${teamSelectedId}` : `card awayGame`;
  const logoClass = show && homeTeamLogo && awayTeamLogo ? "onlyLogo" : "";

  let cardClass = !!homeTeamId && show ? homeOrAway : "card unclickable";
  if (props.isSelected) {
    cardClass += " selected";
  }

  let extBoxClass = show ? "ext-box" : "whiteCard";

  const dateClass = hideDate ? "cardText hideDate" : "cardText";
  return (
    <div className={cardClass} onClick={() => onClick(game)}>
      <div className={extBoxClass}>
        <div>
          <p className={dateClass}>{visibleDate} </p>
          <p className="hourClass">
            {timeStart} {timeZone}
          </p>
        </div>
        <h4 className="cardText">
          {show && awayTeamShort && <img src={awayTeamLogo} alt={awayTeam} />}
          <span className={logoClass}>{awayTeam}</span>
        </h4>
        {awayTeamShort && <p className="cardText vs">vs</p>}
        <h4 className="cardText">
          {show && homeTeamShort && <img src={homeTeamLogo} alt={homeTeam} />}
          <span className={logoClass}>{homeTeam}</span>
        </h4>
        <p className="cardText arena"> {arenaName}</p>
      </div>
    </div>
  );
};

export default TeamCard;
