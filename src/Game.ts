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
    setupKidGame
} from './dragon-poo';


export const DragonPoo: Game<GameState> = {
    name: 'DragonPoo',
    minPlayers: 2,
    maxPlayers: 4,
    setup: ({ctx, random}) => setupGame(ctx.numPlayers, random),
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
    setup: ({ctx}) => setupKidGame(ctx.numPlayers),
    moves: {moveGoblin, enterBoard, endTurn},
    turn: {
        onMove: endTurn
    },
    endIf: ({G}) => {
        for (let playerID in G.players) {
            let player = G.players[playerID];
            if (player.poo >= 3) {
                return {winner: playerID};
            }
        }
    }

};
