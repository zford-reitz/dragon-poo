import { Client } from "boardgame.io/react";
import { setupGame, enterBoard, moveGoblin, rollDragonDie } from "./dragon-poo";
import { DragonPooBoard } from "./Board";
import { GameState } from "./GameState";
import { Game, Ctx } from "boardgame.io";
import * as _ from 'lodash';


const DragonPoo: Game<GameState> = {
  setup: setupGame,
  moves: {
    moveGoblin: moveGoblin,
    enterBoard: enterBoard,
    rollDragonDie: rollDragonDie
  },
  endIf: (G: GameState, ctx: Ctx) => {
    const winningPlayer = _.find(G.players, p => p.poo >= 5);
    if (winningPlayer) {
      return {winner: winningPlayer};
    }
  }

};

const App = Client({ game: DragonPoo, numPlayers: 2, board: DragonPooBoard });

export default App;
