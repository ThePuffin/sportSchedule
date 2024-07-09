import React, { useState } from 'react'
import TeamData from '../../../../temporaryData/allTeams.json'
import type { PropsCard } from '../../../interface/card.js'
import type { GameFormatted } from '../../../interface/game.js'
import { gamesSelected } from '../../../store/store.js'
import './Card.css'
import './colorsTeam.css'

const TeamCard = (props: PropsCard) => {
  const [game, setGame] = useState(props.game)

  const onClick = async (card) => {
    let selectedGamesCopy: GameFormatted[] = []
    selectedGamesCopy = gamesSelected.get()

    const alreadySelected = selectedGamesCopy.find((selectedGame) => selectedGame.uniqueId === card.uniqueId)
    selectedGamesCopy = selectedGamesCopy.filter(
      (selectedGame) => selectedGame.gameDate !== card.gameDate && selectedGame.teamSelectedId !== card.teamSelectedId
    )

    if (!alreadySelected) {
      selectedGamesCopy.push(card)
      selectedGamesCopy.sort((a, b) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime())
    }

    gamesSelected.set(selectedGamesCopy)
    setGame(card)
  }

  const { arenaName, league, awayTeamId, show, selectedTeam, homeTeamId, gameDate, awayTeamShort, homeTeamShort } = game
  let homeTeamLogo
  let awayTeamLogo
  if (homeTeamId) {
    const { activeTeams } = TeamData
    const homeTeamUniqueId = league + '-' + homeTeamId
    homeTeamLogo = activeTeams.find((team) => team.uniqueId === homeTeamUniqueId).teamLogo

    const awayTeamUniqueId = league + '-' + awayTeamId
    awayTeamLogo = activeTeams.find((team) => team.uniqueId === awayTeamUniqueId).teamLogo
  }

  const hideDate = false

  const homeOrAway = selectedTeam ? `card t${homeTeamId}` : `card awayGame`

  let cardClass = !!homeTeamId && show ? homeOrAway : 'card unclickable'
  if (props.isSelected) {
    cardClass += ' selected'
  }

  const extBoxClass = show ? 'ext-box' : 'whiteCard'
  const dateClass = hideDate ? 'cardText hideDate' : 'cardText'
  return (
    <div className={cardClass} onClick={() => onClick(game)}>
      <div className={extBoxClass}>
        <div>
          <p className={dateClass}>{gameDate}</p>
        </div>
        <h4 className="cardText">
          {show && awayTeamShort && <img src={awayTeamLogo} alt={awayTeamShort} />}
          {awayTeamShort}
        </h4>
        {awayTeamShort && <p className="cardText vs">vs</p>}
        <h4 className="cardText">
          {show && homeTeamShort && <img src={homeTeamLogo} alt={homeTeamShort} />}
          {homeTeamShort}
        </h4>
        <p className="cardText arena"> {arenaName}</p>
      </div>
    </div>
  )
}

export default TeamCard
