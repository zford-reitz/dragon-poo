import {GameState} from './GameState';
import {Game} from 'boardgame.io';
import {
    buildWall,
    checkEndTurn,
    enterBoard,
    guideDragon,
    moveGoblin,
    onKidTurnEnd,
    onTurnBegin,
    placeBait,
    requirePlayerMove,
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
        moves: {
            moveGoblin,
            enterBoard,
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
            }
        },
        turn: {
            onBegin: onTurnBegin,
            onMove: checkEndTurn,
            stages: {
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

    }
;

export const DragonPooKids: Game<GameState> = {
    name: 'DragonPooKids',
    minPlayers: 2,
    maxPlayers: 4,
    setup: ({ctx}) => setupKidGame(ctx.numPlayers),
    moves: {moveGoblin, enterBoard},
    turn: {
        maxMoves: 1,
        onEnd: onKidTurnEnd,
        onBegin: requirePlayerMove
    },
    endIf: ({G}) => {
        for (let playerID in G.pooCount) {
            if (G.pooCount[playerID] >= 3) {
                return {winner: playerID};
            }
        }
    }

};
