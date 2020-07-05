import { Client } from "boardgame.io/react";
import { setupGame, enterBoard, moveGoblin } from "./dragon-poo";

const DragonPoo = {
  setup: setupGame,
  moves: {
    moveGoblin: moveGoblin,
    enterBoard: enterBoard
  }
};

const App = Client({ game: DragonPoo, numPlayers: 2 });

export default App;
