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
    smashStuff, unhideGoblin
} from './dragon-poo';
import {PlayerView} from 'boardgame.io/core';


export const DragonPoo: Game<GameState> = {
    name: 'DragonPoo',
    minPlayers: 2,
    maxPlayers: 4,
    setup: ({ctx, random}) => setupGame(ctx.numPlayers, random),
    playerView: PlayerView.STRIP_SECRETS,
    turn: {
        onBegin: unhideGoblin,
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
                    buildWall: {
                        move: buildWall,
                        client: false
                    },
                    placeBait: {
                        move: placeBait,
                        client: false
                    },
                    scurry: {
                        move: scurry,
                        client: false
                    },
                    smashStuff: {
                        move: smashStuff,
                        client: false
                    },
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
