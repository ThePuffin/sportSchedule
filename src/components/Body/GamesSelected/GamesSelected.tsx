import React, { useEffect, useState } from 'react';
import type { GameFormatted } from '../../../interface/game.ts';
import { gamesSelected } from '../../../store/store.js';
import TeamCard from '../TeamCard/TeamCard.tsx';

const GamesSelected = () => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    gamesSelected.subscribe((newGames: GameFormatted[]) => {
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
                    <TeamCard game={game} isSelected={false} />
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
