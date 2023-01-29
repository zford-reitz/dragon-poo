import {GameState} from './GameState';
import {Game} from 'boardgame.io';
import {
    buildWall,
    endTurn,
    enterBoard,
    guideDragon,
    moveGoblin,
    placeBait,
    scurry,
    setupGame,
    setupKidGame,
    smashStuff
} from './dragon-poo';
import {PlayerView} from 'boardgame.io/core';


export const DragonPoo: Game<GameState> = {
    name: 'DragonPoo',
    minPlayers: 2,
    maxPlayers: 4,
    setup: ({ctx, random}) => setupGame(ctx.numPlayers, random),
    playerView: PlayerView.STRIP_SECRETS,
    turn: {
        activePlayers: {
            currentPlayer: 'move'
        },
        stages: {
            move: {
                moves: {moveGoblin, enterBoard, endTurn},
                next: 'playCard'
            },
            playCard: {
                moves: {
                    buildWall,
                    placeBait,
                    scurry,
                    smashStuff,
                    endTurn
                }
            },
            guideDragon: {
                moves: {
                    guideDragon
                }
            }
        }
    },
    endIf: ({G}) => {
        for (let playerID in G.pooCount) {
            if (G.pooCount[playerID] >= 5) {
                return {winner: playerID};
            }
        }
    }

};

export const DragonPooKids: Game<GameState> = {
    name: 'DragonPooKids',
    minPlayers: 2,
    maxPlayers: 4,
    setup: ({ctx}) => setupKidGame(ctx.numPlayers),
    moves: {moveGoblin, enterBoard, endTurn},
    turn: {
        onMove: endTurn
    },
    endIf: ({G}) => {
        for (let playerID in G.pooCount) {
            if (G.pooCount[playerID] >= 3) {
                return {winner: playerID};
            }
        }
    }

};
