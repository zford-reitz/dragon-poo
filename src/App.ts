import { Client } from "boardgame.io/react";
import { setupGame, enterBoard, rollDragonDie, moveGoblin } from "./dragon-poo";
import { DragonPooBoard } from "./Board";
import { GameState } from "./GameState";
import { Game, Ctx } from "boardgame.io";


const DragonPoo: Game<GameState> = {
  setup: setupGame,
  moves: {
    moveGoblin: moveGoblin,
    enterBoard: enterBoard,
    rollDragonDie: rollDragonDie
  },
  endIf: (G: GameState, ctx: Ctx) => {
    for (let playerID in G.players) {
      let player = G.players[playerID];
      if (player.poo >= 5) {
        return {winner: playerID};
      }
    }
  }

};

const App = Client({ game: DragonPoo, numPlayers: 2, board: DragonPooBoard });

export default App;
