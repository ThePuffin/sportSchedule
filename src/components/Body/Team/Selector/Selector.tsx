import Select from 'react-select';
import type { TeamType } from '../../../../interface/team.ts';
import { teamSelected } from '../../../../store/store.js';
import { Component } from 'react';

export default class Selector extends Component<any, any> {
  constructor(props) {
    super(props);

    this.state = {
      availableTeams: [],
      teamsSelectedIds: props.teamsSelectedIds,
      activeTeams: props.activeTeams,
      i: props.i,
      teamSelectedId: props.teamSelectedId,
      label: '',
    };
  }

  subcriptionTeams = undefined;

  defineAvailableTeams(teamsSelectedIds) {
    const { activeTeams, teamSelectedId } = this.state;
    const teamId = teamSelectedId;
    const selectedTeams = teamsSelectedIds.filter((team: string) => team !== teamId);

    let selectableTeams = activeTeams.filter((team: TeamType) => !selectedTeams.includes(team.id));

    const teamData = activeTeams.find((team: TeamType) => team.value === teamId);
    const { label = '' } = teamData;
    this.setState(() => ({
      availableTeams: selectableTeams,
      label,
    }));
  }

  subscribeTogamesSelected() {
    const newSubscriptionGames = teamSelected.subscribe((teams) => {
      this.setState(() => ({
        teamsSelectedIds: teams,
      }));
      this.defineAvailableTeams(teams);
    });

    // Store the subscriptionTeam for later cleanup
    this.subcriptionTeams = newSubscriptionGames;
  }

  async componentDidMount() {
    const { teamsSelectedIds } = this.state;

    this.subscribeTogamesSelected();

    if (teamSelected.get().includes(undefined)) {
      teamSelected.set(teamsSelectedIds);
    }
    this.defineAvailableTeams(teamsSelectedIds);
  }

  componentWillUnmount() {
    if (this.subcriptionTeams) {
      this.subcriptionTeams.unsubscribe();
    }
  }

  changeTeam = async (event: { value: string }) => {
    const newSelection = event.value;
    let teamsId = [...teamSelected.get()];
    teamsId[this.state.i] = newSelection;

    await this.setState(() => ({
      teamSelectedId: newSelection,
    }));
    teamSelected.set(teamsId);
    // const selectedTeams = teamsId.filter((team: string) => team !== teamId);
    // const newAvailableTeams = activeTeams.filter((team: TeamType) => !selectedTeams.includes(team.id));
    // this.setState(() => ({
    //   availableTeams: newAvailableTeams,
    // }));
  };

  render() {
    const { availableTeams, teamSelectedId, label } = this.state;
    return (
      <div className="App">
        <Select
          defaultValue={teamSelectedId}
          placeholder={label}
          isSearchable
          options={availableTeams}
          onChange={this.changeTeam}
        />
      </div>
    );
  }
}
