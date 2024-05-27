import React, { Component, useEffect } from 'react';
import { teamSelected } from '../../store/store.js';

export default class Test extends Component {
  constructor(props) {
    super(props);
    this.state = { team: props.test, i: props.i };
  }
  divId = `${Math.random()}`;
  subscription = undefined;

  subscribeToTeamSelected() {
    // Call the subscribe method on teamSelected
    const subscription = teamSelected.subscribe((newSelections) => {
      const i = this.state.i;
      const newSelection = newSelections[i];
      if (newSelection && this.state.team !== newSelection) {
        console.log(this.state.i, '++++', newSelection, this.state.team);
        this.setState({ team: newSelection });
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
      <div id={this.divId} className="App">
        <p>team :{this.state.team}</p>
      </div>
    );
  }
}
