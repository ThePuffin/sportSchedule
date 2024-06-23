import { Component } from 'react';
import currentSeason from '../../../../../temporaryData/currentSeason.json';
import type { TeamType } from '../../../../interface/types.js';
import { teamSelected, dateSelected } from '../../../../store/store.js';
import { readableDate } from '../../../../utils/date.js';
import './Card.css';
import './colorsTeam.css';

export default class TeamCard extends Component<any, any> {
  constructor(props) {
    super(props);
    const team = props.activeTeams[props.i];
    const dateSelection = dateSelected.get();

    this.state = {
      team,
      i: props.i,
      allGames: props.allGames,
      activeTeams: props.activeTeams,
      id: team.id,
      showAway: false,
      showHome: true,
      beginingDate: readableDate(dateSelection.beginingDate),
      finishingDate: readableDate(dateSelection.finishingDate),
    };
  }

  subscriptionTeam = undefined;
  subscriptionDate = undefined;

  subscribeToTeamSelected() {
    // Call the subscribe method on teamSelected
    const newSubscriptionTeam = teamSelected.subscribe((newSelections) => {
      const i = this.state.i;
      const newSelectionId = newSelections[i];

      if (newSelectionId && this.state.id !== newSelectionId) {
        const newTeam = this.state.activeTeams.find((activeTeam: TeamType) => activeTeam.id === newSelectionId);
        this.getGames(newSelectionId);
        this.setState((_) => ({
          team: newTeam,
          id: newTeam.id,
        }));
      }
    });

    // Store the subscriptionTeam for later cleanup
    this.subscriptionTeam = newSubscriptionTeam;
  }

  subscribeToDateSelected() {
    // Call the subscribe method on teamSelected
    const newSubscriptionDate = dateSelected.subscribe(({ beginingDate, finishingDate }) => {
      this.setState((_) => ({
        beginingDate: readableDate(beginingDate),
        finishingDate: readableDate(finishingDate),
      }));

      this.getGames(this.state.id);
    });

    // Store the subscriptionTeam for later cleanup
    this.subscriptionDate = newSubscriptionDate;
  }

  async componentDidMount() {
    this.getGames(this.state.id);
    this.subscribeToTeamSelected();
    this.subscribeToDateSelected();
  }

  componentWillUnmount() {
    // Unsubscribe when the component unmounts to avoid memory leaks
    if (this.subscriptionTeam) {
      this.subscriptionTeam.unsubscribe();
    }
    if (this.subscriptionDate) {
      this.subscriptionDate.unsubscribe();
    }
  }
  getGames(teamSelectedId) {
    try {
      const games = currentSeason[teamSelectedId];
      let newGamesData = [];
      if (games) {
        newGamesData = games

          .filter((game) => game.gameDate > this.state.beginingDate && game.gameDate < this.state.finishingDate)
          .map((game) => {
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
      }
      this.setState({ gamesData: newGamesData });
    } catch (error) {
      console.log('Error fetching game data =>', error);
    }
  }

  render() {
    if (this.state.gamesData?.length) {
      const lastGame = this.state.gamesData?.length - 1;
      return (
        <div id={this.state.team.id} className="App">
          <h2>
            <img src={this.state.team.teamLogo} alt={this.state.team.value} />
            {this.state.team.label}
          </h2>
          <p> {this.state?.beginingDate}</p>
          <p> {this.state?.finishingDate}</p>
          <h5>Last game: {this.state.gamesData?.[lastGame]?.gameDate} </h5>
          <p>{this.state.gamesData?.[lastGame]?.homeTeamId}</p>
          vs
          <p>{this.state.gamesData?.[lastGame]?.awayTeamId}</p>
        </div>

        // TODO: uncomment when columns are ok

        // this.state.gamesData.map((data) => {
        //   const hideDate = false;
        //   const dateSelected = new Date();
        //   const { arenaName, show, selectedTeam, homeTeamId, gameDate, awayTeamShort, homeTeamShort } = data;
        //   const { team } = this.state;
        //   const cardClass =
        //     arenaName && show ? (selectedTeam ? `card t${homeTeamId}` : `card awayGame`) : 'card unclickable';
        //   const extBoxClass = show ? 'ext-box' : 'whiteCard';
        //   const dateClass = hideDate ? 'cardText hideDate' : 'cardText';
        //   return (
        //     <div className={cardClass}>
        //       <div>
        //         <div className={extBoxClass}>
        //           <div>
        //             <p className={dateClass}>{gameDate}</p>
        //           </div>
        //           <h4 className="cardText">{awayTeamShort}</h4>
        //           {!show && <img src={team.teamLogo} alt={team.value} />}
        //           <p className="cardText vs">vs</p>
        //           <h4 className="cardText">{homeTeamShort}</h4>
        //           {show && <img src={team.teamLogo} alt={team.value} />}
        //           <p className="cardText arena"> {arenaName}</p>
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
