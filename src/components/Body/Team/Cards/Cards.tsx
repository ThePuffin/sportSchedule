import { Component } from "react";
import type { PropsCards } from "../../../../interface/card";
import type { GameFormatted } from "../../../../interface/game";
import type { NHLGameAPI } from "../../../../interface/gameNHL";
import type { TeamType } from "../../../../interface/team";
import {
  dateSelected,
  gamesSelected,
  teamSelected,
} from "../../../../store/store.js";
import { readableDate } from "../../../../utils/date.js";
import TeamCard from "../../TeamCard/TeamCard.tsx";

export default class Cards extends Component<any, any> {
  constructor(props: PropsCards) {
    super(props);

    const team = props.activeTeams.find(
      (team) => team.value === props.teamSelectedId,
    );

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
      selectedGames: gamesSelected.get(),
      teamsGames: props.teamsGames,
    };
  }

  subscribeToTeamSelected() {
    // Call the subscribe method on teamSelected
    teamSelected.subscribe((newSelections) => {
      const i = this.state.i;
      const newSelectionId = newSelections[i];

      if (newSelectionId && this.state?.id !== newSelectionId) {
        const newTeam = this.state.activeTeams.find(
          (activeTeam: TeamType) => activeTeam?.value === newSelectionId,
        );

        this.getGames(newSelectionId);
        this.setState(() => ({
          team: newTeam,
          id: newTeam.id,
        }));
      }
    });
  }

  subscribeToDateSelected() {
    // Call the subscribe method on teamSelected
    dateSelected.subscribe(({ beginingDate, finishingDate }) => {
      const dateBegining = readableDate(beginingDate);
      const dateFinishing = readableDate(finishingDate);
      this.setState(() => ({
        beginingDate: dateBegining,
        finishingDate: dateFinishing,
      }));

      this.getGames(this.state.team.value, {
        beginingDate: dateBegining,
        finishingDate: dateFinishing,
      });
    });
  }

  subscribeToGamesSelected() {
    // Call the subscribe method on teamSelected
    gamesSelected.subscribe((games) => {
      this.setState(() => ({
        selectedGames: games,
      }));
    });
  }

  async componentDidMount() {
    this.getGames(this.state.id);
    this.subscribeToTeamSelected();
    this.subscribeToDateSelected();
    this.subscribeToGamesSelected();
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

  getGames(
    teamSelectedId: string,
    { beginingDate, finishingDate } = this.state,
  ) {
    try {
      const allDates = this.getDatesBetween(beginingDate, finishingDate);

      const games = this.state.teamsGames.filter(
        (game) => game.teamSelectedId === teamSelectedId,
      );

      if (games) {
        const gamesLookup = games.reduce((acc, gameData: NHLGameAPI) => {
          if (
            gameData.gameDate > beginingDate &&
            gameData.gameDate < finishingDate
          ) {
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
      return this.state.gamesData.map((data: GameFormatted) => {
        const isSelected = this.state.selectedGames.find(
          (selectedGame: GameFormatted) =>
            selectedGame.uniqueId === data.uniqueId,
        );

        return (
          <TeamCard key={data.uniqueId} game={data} isSelected={!!isSelected} />
        );
      });
    } else {
      return (
        <div key={this.state.i}>
          <p>wait for it...</p>
        </div>
      );
    }
  }
}
