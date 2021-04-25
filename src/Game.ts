import { GameState } from "./GameState";
import { Game, Ctx } from "boardgame.io";
import { setupGame, enterBoard, moveGoblin, playCard, endTurn, setupKidGame, onEndTurn } from "./dragon-poo";


export const DragonPoo: Game<GameState> = {
    name: 'DragonPoo',
    minPlayers: 2,
    maxPlayers: 4,
    setup: setupGame,
    turn: {
      onEnd: onEndTurn,
      activePlayers: {
        currentPlayer: 'move'
      },
      stages: {
        move: {
          moves: {moveGoblin, enterBoard, endTurn},
          next: 'playCard'
        },
        playCard: {
          moves: {playCard, endTurn}
        }
      }
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
  
  export const DragonPooKids: Game<GameState> = {
    name: 'DragonPooKids',
    minPlayers: 2,
    maxPlayers: 4,
    setup: setupKidGame,
    moves: {moveGoblin, enterBoard, endTurn},
    turn: {
      onEnd: onEndTurn,
      moveLimit: 1
    },
    endIf: (G: GameState, ctx: Ctx) => {
      for (let playerID in G.players) {
        let player = G.players[playerID];
        if (player.poo >= 3) {
          return {winner: playerID};
        }
      }
    }
  
  };