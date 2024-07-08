import React, { useEffect, useState } from 'react';
import { gamesSelected } from '../../../store/store.js';
import TeamCard from '../TeamCard/TeamCard.tsx';
import Type {GameFormatted} from '../../../interface/game.ts'

const GamesSelected = (props) => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    const subscription = gamesSelected.subscribe((newGames: GameFormatted) => {
      setGames(newGames);
    });

    // Cleanup function
    return () => {
      // if (subscription) {
      //   subscription.unsubscribe()
      // }
    };
  }, []);

  if (games.length) {
    return (
      <div>
        <table style={{ tableLayout: 'fixed', width: '100%' }}>
          <tbody>
            <tr>
              {games.map((game) => {
                return (
                  <td key={game.uniqueId}>
                    <TeamCard game={game} />
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    );
  } else {
    return <div></div>;
  }
};

export default GamesSelected;
