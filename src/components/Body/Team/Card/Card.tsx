import { Component } from 'react';
import currentSeason from '../../../../../temporaryData/updatecurrentSeason.json';
import type { PropsCard } from '../../../../interface/card.ts';
import type { GameAPI, GameFormatted } from '../../../../interface/game.ts';
import type { TeamType } from '../../../../interface/team.ts';
import { dateSelected, teamSelected } from '../../../../store/store.js';
import { readableDate } from '../../../../utils/date.js';
import './Card.css';
import './colorsTeam.css';
export default class TeamCard extends Component<any, any> {
  constructor(props: PropsCard) {
    super(props);

    const team = props.activeTeams.find((team) => team.id === props.teamSelectedId);
    const dateSelection = dateSelected.get();

    this.state = {
      team,
      i: props.i,
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
        this.setState(() => ({
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
      this.setState(() => ({
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
    // const comments = await db.select().from(Teams).where(eq(Teams.value, this.state.id));
    // console.log('++++++++', comments);
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

  getDatesBetween(startDate: string, endDate: string) {
    const dates = [];
    const maxDate = new Date(endDate);
    let currentDate = new Date(startDate);

    while (currentDate <= maxDate) {
      dates.push(readableDate(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }

  getGames(teamSelectedId: string) {
    try {
      const allDates = this.getDatesBetween(this.state.beginingDate, this.state.finishingDate);
      const games = currentSeason[teamSelectedId];
      if (games) {
        const gamesLookup = games.reduce((acc, gameData: GameAPI) => {
          // console.log(gameData.gameDate, this.state.beginingDate);

          if (gameData.gameDate > this.state.beginingDate && gameData.gameDate < this.state.finishingDate) {
            acc[gameData.gameDate] = gameData;
          }
          return acc;
        }, {});

        const allNewGamesData = allDates.map((date) => (gamesLookup[date] ? gamesLookup[date] : { gameDate: date }));

        this.setState({ gamesData: allNewGamesData });
      }
    } catch (error) {
      console.log('Error fetching game data =>', error);
    }
  }

  render() {
    if (this.state.gamesData?.length) {
      return this.state.gamesData.map((data: GameFormatted) => {
        const hideDate = false;
        const { arenaName, show, selectedTeam, homeTeamId, gameDate, awayTeamShort, homeTeamShort } = data;
        const { team } = this.state;

        const cardClass =
          arenaName && show ? (selectedTeam ? `card t${homeTeamId}` : `card awayGame`) : 'card unclickable';
        const extBoxClass = show ? 'ext-box' : 'whiteCard';
        const dateClass = hideDate ? 'cardText hideDate' : 'cardText';
        const { teamLogo, value } = team;

        return (
          <div className={cardClass}>
            <div>
              <div className={extBoxClass}>
                <div>
                  <p className={dateClass}>{gameDate}</p>
                </div>
                <h4 className="cardText">
                  {awayTeamShort}
                  {!show && awayTeamShort && <img src={teamLogo} alt={value} />}
                </h4>
                {awayTeamShort && <p className="cardText vs">vs</p>}
                <h4 className="cardText">
                  {homeTeamShort}
                  {show && homeTeamShort && <img src={teamLogo} alt={value} />}
                </h4>
                <p className="cardText arena"> {arenaName}</p>
              </div>
            </div>
          </div>
        );
      });
    } else {
      return <p>wait for it...</p>;
    }
  }
}
