import { Client } from "boardgame.io/react";
import { setupGame, enterBoard, moveGoblin } from "./dragon-poo";
import { DragonPooBoard } from "./Board";

const DragonPoo = {
  setup: setupGame,
  moves: {
    moveGoblin: moveGoblin,
    enterBoard: enterBoard
  }
};

const App = Client({ game: DragonPoo, numPlayers: 2, board: DragonPooBoard });

export default App;
