export const getStoredSelectedGames = () => {
  console.log();
  if (!localStorage.getItem("gameSelected")) {
    return;
  } else {
    return localStorage
      .getItem("gameSelected")
      .split(";")
      .map((game) => {
        try {
          return JSON.parse(game);
        } catch (e) {
          console.error(`"${game}" is not valid JSON.`);
          return null;
        }
      })
      .filter((game) => game !== null);
  }
};
