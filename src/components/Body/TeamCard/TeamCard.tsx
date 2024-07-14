import React, { useState } from 'react';
import TeamDataMLB from '../../../../temporaryData/allTeamsMLB.json';
import TeamDataNBA from '../../../../temporaryData/allTeamsNBA.json';
import TeamDataNFL from '../../../../temporaryData/allTeamsNFL.json';
import TeamDataNHL from '../../../../temporaryData/allTeamsNHL.json';
import type { PropsCard } from '../../../interface/card.js';
import type { GameFormatted } from '../../../interface/game.js';
import { gamesSelected } from '../../../store/store.js';
import './TeamCard.css';
import './colorsTeam.css';

const TeamCard = (props: PropsCard) => {
  const [game, setGame] = useState(props.game);

  const onClick = async (card) => {
    let selectedGamesCopy: GameFormatted[] = [];
    selectedGamesCopy = gamesSelected.get();

    const alreadySelected = selectedGamesCopy.find((selectedGame) => selectedGame.uniqueId === card.uniqueId);
    selectedGamesCopy = selectedGamesCopy.filter(
      (selectedGame) => selectedGame.gameDate !== card.gameDate && selectedGame.teamSelectedId !== card.teamSelectedId
    );

    if (!alreadySelected) {
      selectedGamesCopy.push(card);
      selectedGamesCopy.sort((a, b) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime());
    }

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
  } = game;
  let homeTeamLogo;
  let awayTeamLogo;
  if (homeTeamId) {
    const activeTeams = [
      ...TeamDataNHL.activeTeams,
      ...TeamDataNFL.activeTeams,
      ...TeamDataNBA.activeTeams,
      ...TeamDataMLB.activeTeams,
    ];
    const homeTeamUniqueId = league + '-' + homeTeamId;

    console.log(
      homeTeamUniqueId,
      activeTeams[72],
      activeTeams.find((team) => team.uniqueId == homeTeamUniqueId)
    );

    homeTeamLogo = activeTeams.find((team) => team.uniqueId === homeTeamUniqueId)?.teamLogo;

    const awayTeamUniqueId = league + '-' + awayTeamId;
    awayTeamLogo = activeTeams.find((team) => team.uniqueId === awayTeamUniqueId)?.teamLogo;
  }

  const hideDate = false;

  const homeOrAway = selectedTeam ? `card t${teamSelectedId}` : `card awayGame`;

  let cardClass = !!homeTeamId && show ? homeOrAway : 'card unclickable';
  if (props.isSelected) {
    cardClass += ' selected';
  }

  const extBoxClass = show ? 'ext-box' : 'whiteCard';
  const dateClass = hideDate ? 'cardText hideDate' : 'cardText';
  return (
    <div className={cardClass} onClick={() => onClick(game)}>
      <div className={extBoxClass}>
        <div>
          <p className={dateClass}>{gameDate}</p>
        </div>
        <h4 className="cardText">
          {show && awayTeamShort && <img src={awayTeamLogo} alt={awayTeam} />}
          {awayTeamShort}
        </h4>
        {awayTeamShort && <p className="cardText vs">vs</p>}
        <h4 className="cardText">
          {show && homeTeamShort && <img src={homeTeamLogo} alt={homeTeam} />}
          {homeTeamShort}
        </h4>
        <p className="cardText arena"> {arenaName}</p>
      </div>
    </div>
  );
};

export default TeamCard;
