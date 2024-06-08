import './Card.css';
import './colorsTeam.css';
import React, { Component, useEffect } from 'react';
import { teamSelected } from '../../../../store/store.js';
import currentSeason from '../../../../../temporaryData/currentSeason.json';
import axios from 'axios';
import { readableDate } from '../../../../utils/date.js';

export default class TeamCard extends Component<any, any> {
  constructor(props) {
    super(props);
    const team = props.activeTeams[props.i];
    this.state = {
      team,
      i: props.i,
      activeTeams: props.activeTeams,
      id: team.id,
      showAway: false,
      showHome: true,
      gamesData: [],
    };
  }

  subscription = undefined;

  subscribeToTeamSelected() {
    // Call the subscribe method on teamSelected
    const subscription = teamSelected.subscribe((newSelections) => {
      const i = this.state.i;
      const newSelectionId = newSelections[i];

      if (newSelectionId && this.state.id !== newSelectionId) {
        const newTeam = this.state.activeTeams.find((activeTeam) => activeTeam.id === newSelectionId);
        this.getGames(newSelectionId);
        this.setState({ team: newTeam, id: newTeam.id });
      }
    });

    // Store the subscription for later cleanup
    this.subscription = subscription;
  }

  async componentDidMount() {
    this.getGames(this.state.id);
    this.subscribeToTeamSelected();
  }

  componentWillUnmount() {
    // Unsubscribe when the component unmounts to avoid memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  getGames(teamSelectedId) {
    try {
      const { games } = currentSeason[teamSelectedId];

      const newGamesData = games.map((game) => {
        return {
          awayTeamId: game.awayTeam.abbrev,
          awayTeamShort: game.awayTeam.abbrev,
          homeTeamId: game.homeTeam.abbrev,
          homeTeamShort: game.homeTeam.abbrev,
          arenaName: game.venue?.default || '',
          gameDate: readableDate(game.gameDate),
          teamSelectedId,
          timestampDate: new Date(game.gameDate).getTime(),
          show:
            (game.homeTeam.abbrev === teamSelectedId && this.state.showHome) ||
            (game.awayTeam.abbrev === teamSelectedId && this.state.showAway),
          selectedTeam: game.homeTeam.abbrev === teamSelectedId,
        };
      });
      this.setState({ gamesData: newGamesData });
    } catch (error) {
      console.log('error', error);
    }
  }

  render() {
    const hideDate = false;
    const dateSelected = new Date();

    if (this.state.team.id && this.state.gamesData.length) {
      const lastGame = this.state.gamesData.length - 1;
      return (
        <div id={this.state.team.id} className="App">
          <h2>
            <img src={this.state.team.teamLogo} alt={this.state.team.value} />
            {this.state.team.label}
          </h2>
          <h5>Last game: </h5>
          <p>{this.state.gamesData?.[lastGame]?.homeTeamId}</p>
          vs
          <p>{this.state.gamesData?.[lastGame]?.awayTeamId}</p>
        </div>

        // TODO: uncomment when columns are ok
        // this.state.gamesData &&
        // this.state.gamesData.map((data) => {
        //   return (
        //     <div
        //       className={
        //         data.arenaName && data.show
        //           ? data.selectedTeam
        //             ? `card t${data.homeTeamId}`
        //             : `card awayGame`
        //           : 'card unclickable'
        //       }
        //     >
        //       <div className={dateSelected >= 0 ? 'selected' : ''}>
        //         <div className={data.show ? 'ext-box' : 'whiteCard'}>
        //           <div>
        //             <p className={hideDate ? 'cardText hideDate' : 'cardText'}>{data.gameDate}</p>
        //           </div>
        //           <h4 className="cardText">{data.awayTeamShort}</h4>
        //           {!data.show ? <img src={this.state.team.teamLogo} alt={this.state.team.value} /> : ''}
        //           <p className="cardText vs">vs</p>
        //           <h4 className="cardText">{data.homeTeamShort}</h4>
        //           {data.show ? <img src={this.state.team.teamLogo} alt={this.state.team.value} /> : ''}
        //           <p className="cardText arena"> {data.arenaName}</p>
        //         </div>
        //       </div>
        //     </div>
        //   );
        // })
      );
    } else {
      return <p>wait for it...</p>;
    }
  }
}
