import { Component } from "react";
import currentSeason from "../../../../../temporaryData/currentSeason.json";
import type { TeamType } from "../../../../interface/types.js";
import { dateSelected, teamSelected } from "../../../../store/store.js";
import { readableDate } from "../../../../utils/date.js";
import type { PropsCard } from "../interface/card.ts";
import type { GameAPI, GameFormatted } from "../interface/game.ts";
import "./Card.css";
import "./colorsTeam.css";
export default class TeamCard extends Component<any, any> {
  constructor(props: PropsCard) {
    super(props);
    const team = props.activeTeams[props.i];
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
        const newTeam = this.state.activeTeams.find(
          (activeTeam: TeamType) => activeTeam.id === newSelectionId,
        );
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
    const newSubscriptionDate = dateSelected.subscribe(
      ({ beginingDate, finishingDate }) => {
        this.setState(() => ({
          beginingDate: readableDate(beginingDate),
          finishingDate: readableDate(finishingDate),
        }));

        this.getGames(this.state.id);
      },
    );

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

  getDatesBetween(startDate, endDate) {
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
      const allDates = this.getDatesBetween(
        this.state.beginingDate,
        this.state.finishingDate,
      );
      const games = currentSeason[teamSelectedId];
      let newGamesData = [];
      if (games) {
        const gamesLookup = games.reduce((acc, game: GameAPI) => {
          if (
            game.gameDate > this.state.beginingDate &&
            game.gameDate < this.state.finishingDate
          ) {
            const gameData = {
              awayTeamId: game.awayTeam.abbrev,
              awayTeamShort: game.awayTeam.abbrev,
              homeTeamId: game.homeTeam.abbrev,
              homeTeamShort: game.homeTeam.abbrev,
              arenaName: game.venue?.default || "",
              gameDate: readableDate(game.gameDate),
              teamSelectedId,
              timestampDate: new Date(game.gameDate).getTime(),
              show:
                (game.homeTeam.abbrev === teamSelectedId &&
                  this.state.showHome) ||
                (game.awayTeam.abbrev === teamSelectedId &&
                  this.state.showAway),
              selectedTeam: game.homeTeam.abbrev === teamSelectedId,
            };
            acc[gameData.gameDate] = gameData;
          }
          return acc;
        }, {});

        const allNewGamesData = allDates.map((date) =>
          gamesLookup[date] ? gamesLookup[date] : { gameDate: date },
        );

        this.setState({ gamesData: allNewGamesData });
      }
    } catch (error) {
      console.log("Error fetching game data =>", error);
    }
  }

  render() {
    if (this.state.gamesData?.length) {
      // const lastGame = this.state.gamesData?.length - 1;
      // return (
      // <div id={this.state.team.id} className="App">
      //   <h2>
      //     <img src={this.state.team.teamLogo} alt={this.state.team.value} />
      //     {this.state.team.label}
      //   </h2>
      //   <p> {this.state?.beginingDate}</p>
      //   <p> {this.state?.finishingDate}</p>
      //   <h5>Last game: {this.state.gamesData?.[lastGame]?.gameDate} </h5>
      //   <p>{this.state.gamesData?.[lastGame]?.homeTeamId}</p>
      //   vs
      //   <p>{this.state.gamesData?.[lastGame]?.awayTeamId}</p>
      // </div>

      // TODO: uncomment when columns are ok

      return this.state.gamesData.map((data: GameFormatted) => {
        const hideDate = false;
        const {
          arenaName,
          show,
          selectedTeam,
          homeTeamId,
          gameDate,
          awayTeamShort,
          homeTeamShort,
        } = data;
        const { team } = this.state;
        const cardClass =
          arenaName && show
            ? selectedTeam
              ? `card t${homeTeamId}`
              : `card awayGame`
            : "card unclickable";
        const extBoxClass = show ? "ext-box" : "whiteCard";
        const dateClass = hideDate ? "cardText hideDate" : "cardText";
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
