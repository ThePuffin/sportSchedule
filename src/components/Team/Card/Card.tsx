import './Card.css';
import React, { Component, useEffect } from 'react';
import { teamSelected } from '../../../store/store.js';

export default class TeamCard extends Component {
  constructor(props) {
    super(props);
    const team = props.activeTeams[props.i];
    this.state = {
      team,
      i: props.i,
      activeTeams: props.activeTeams,
      id: team.id,
    };
  }
  divId = `${Math.random()}`;
  subscription = undefined;

  subscribeToTeamSelected() {
    // Call the subscribe method on teamSelected
    const subscription = teamSelected.subscribe((newSelections) => {
      const i = this.state.i;
      const newSelectionId = newSelections[i];

      if (newSelectionId && this.state.id !== newSelectionId) {
        const newTeam = this.state.activeTeams.find((activeTeam) => activeTeam.id === newSelectionId);
        this.setState({ team: newTeam });
      }
    });

    // Store the subscription for later cleanup
    this.subscription = subscription;
  }

  componentDidMount() {
    this.subscribeToTeamSelected();
  }

  componentWillUnmount() {
    // Unsubscribe when the component unmounts to avoid memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  render() {
    return (
      <div id={this.state.team.id} className="App">
        <h2>
          {this.state.i + 1}
          <img src={this.state.team.teamLogo} alt={this.state.team.value} />
          {this.state.team.label}
        </h2>
      </div>
    );
  }
}
