import { Component } from 'react';
import { gamesSelected } from '../../../store/store.js';

export default class GamesSelected extends Component<any, any> {
  constructor(props) {
    super(props);

    this.state = {
      gamesSelected: [],
    };
  }
  subcriptionGames = undefined;
  subscribeTogamesSelected() {
    const newSubscriptionGames = gamesSelected.subscribe((games) => {
      this.setState(() => ({
        gamesSelected: games,
      }));
    });

    // Store the subscriptionTeam for later cleanup
    this.subcriptionGames = newSubscriptionGames;
  }

  async componentDidMount() {
    this.subscribeTogamesSelected();
  }

  componentWillUnmount() {
    if (this.subcriptionGames) {
      this.subcriptionGames.unsubscribe();
    }
  }

  render() {
    if (this.state.gamesSelected.length) {
      return (
        <div>
          <table style={{ tableLayout: 'fixed', width: '100%' }}>
            <tbody>
              {this.state.gamesSelected.map(({ uniqueId }) => {
                return <tr key={uniqueId}>{uniqueId}</tr>;
              })}
            </tbody>
          </table>
        </div>
      );
    } else {
      return (
        <div>
          <p>select some games</p>
        </div>
      );
    }
  }
}
