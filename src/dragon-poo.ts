import { INVALID_MOVE } from 'boardgame.io/core';
import { Location } from './location';
import { Wall } from './wall';
import * as _ from 'lodash';
import { Poo } from './poo';

export const DRAGON = "Dragon";

export type Direction = 'up' | 'down' | 'left' | 'right';

function moveFrom(startLocation: Location, direction: Direction): Location {
  switch (direction) {
    case 'up':
        return new Location(startLocation.row - 1, startLocation.column);
    case 'down':
      return new Location(startLocation.row + 1, startLocation.column);
    case 'left':
      return new Location(startLocation.row, startLocation.column - 1);
    case 'right':
      return new Location(startLocation.row, startLocation.column + 1);
  }

  return startLocation;
}

function bounce(direction: Direction): Direction {
  if (direction === 'up') {
    return 'down';
  } else if (direction === 'down') {
    return 'up';
  } else if (direction === 'left') {
    return 'right';
  } else if (direction === 'right') {
    return 'left';
  }

  return direction;
}

export function setupGame(ctx: any) {
  // TODO zeb can't assume 4 players
  // TODO zeb let players choose color at start of game, rather than making it a part of setup

  const G = {
    players: {
      "0": {
        entranceRows: [1, 2, 3],
        entranceColumns: [0],
        poo: 0
      },
      "1": {
        entranceRows: [0],
        entranceColumns: [1, 2, 3],
        poo: 0
      }
    },
    flow: {
      endGameIf: (G: any, ctx: any) => {
        const winningPlayer = _.find(G.players, p => p.poo >= 5);
        if (winningPlayer) {
          return {winner: winningPlayer};
        }
      }
    },
    cells: Array.from(Array(5), () => Array.from(Array(5), () => [] as any)),
    walls: [],
    pooTokens: []
  };

  G.cells[2][2].push(DRAGON);

  return G;
}

export function enterBoard(G: any, ctx: any, row: number, column: number) {
  let player = G.players[ctx.playerID];
  if (
    player.entranceRows.includes(row) &&
    player.entranceColumns.includes(column) &&
    isValidMoveLocation({row: row, column: column}, G.cells)
  ) {
    G.cells[row][column].push(ctx.playerID);
  } else {
      return INVALID_MOVE;
  }
}

/**
 * Moves a player's piece orthoganally on the board.
 *
 * @param {*} G
 * @param {*} ctx
 */
export function moveGoblin(G: any, ctx: any, direction: Direction) {
  const initialLocation: Location | undefined = findPlayerLocation(ctx.playerID, G.cells);

  if (initialLocation) {
    const newLocation: Location = moveFrom(initialLocation, direction);
    if (isValidMoveLocation(newLocation, G.cells)) {
      G.cells[initialLocation.row][initialLocation.column] = 
        removeFromLocation(G.cells[initialLocation.row][initialLocation.column], ctx.playerID);
      G.cells[newLocation.row][newLocation.column].push(ctx.playerID);
    }
  }

  return INVALID_MOVE;
}

export function removeFromLocation(cell: Array<string>, playerID: string): Array<string> {
  return cell.filter((e) => e !== playerID);
}

function isLocationOnBoard(newLocation: Location, cells: any[][]) {
  return newLocation.row >= 0 && cells.length > newLocation.row
    && newLocation.column >= 0 && cells[0].length > newLocation.column;
}

function isValidMoveLocation(newLocation: Location, cells: any[][]) {
  return isLocationOnBoard(newLocation, cells)
    && !cells[newLocation.row][newLocation.column].includes(DRAGON);
}

export function findPlayerLocation(playerID: string, grid: Array<Array<Array<string>>>): Location | undefined {
  for (let row = 0; row < grid.length; row++) {
    for (let column = 0; column < grid[row].length; column++) {
      if (grid[row][column].includes(playerID)) {
        return new Location(row, column);
      }
    }
  }  
}

export function findDragonLocation(grid: Array<Array<Array<string>>>): Location | undefined {
  for (let row = 0; row < grid.length; row++) {
    for (let column = 0; column < grid[row].length; column++) {
      if (grid[row][column].includes(DRAGON)) {
        return new Location(row, column);
      }
    }
  }
}

export function moveDragon(G: any, direction: Direction) {
  const initialLocation: Location | undefined = findDragonLocation(G.cells);

  if (initialLocation) {
    const newLocation: Location = moveFrom(initialLocation, direction);
    const blockingWall: Wall = findBlockingWall(G, initialLocation, newLocation);
    if (blockingWall) {
      // don't move. eat wall instead.
      _.remove(G.walls, blockingWall);
    } else if (isLocationOnBoard(newLocation, G.cells)) {
      G.cells[initialLocation.row][initialLocation.column] = 
        removeFromLocation(G.cells[initialLocation.row][initialLocation.column], DRAGON);
      G.cells[newLocation.row][newLocation.column].push(DRAGON);
    } else {
      // go the other way instead
      const bounceDirection = bounce(direction);
      const bounceLocation: Location = moveFrom(initialLocation, bounceDirection);
      G.cells[initialLocation.row][initialLocation.column] = 
        removeFromLocation(G.cells[initialLocation.row][initialLocation.column], DRAGON);
      G.cells[bounceLocation.row][bounceLocation.column].push(DRAGON);
    }
  }

  // do we stomp anyone?
  const newDragonLocation: Location | undefined = findDragonLocation(G.cells);
  if (newDragonLocation) {
    const cell = G.cells[newDragonLocation.row][newDragonLocation.column];
    _.remove(cell, e => e !== DRAGON).forEach((playerID: any) => {
      const player = G.players[playerID as number];
      var i;
      for (i = 0; i < player.poo; i++) {
        G.pooTokens.push(new Poo(newDragonLocation));
      }
      player.poo = 0;
    });
  }
}

function findBlockingWall(G: any, initialLocation: Location, newLocation: Location): Wall {
  return _.find(G.walls, wall => wall.isBetween(initialLocation, newLocation));
}


export function unsafeMoveDragon(G: any, row: number, column: number) {
  const dragonLocationBefore: Location | undefined = findDragonLocation(G.cells);
  if (dragonLocationBefore) {
      G.cells[dragonLocationBefore.row][dragonLocationBefore.column] = 
      removeFromLocation(G.cells[dragonLocationBefore.row][dragonLocationBefore.column], DRAGON);
  }

  G.cells[row][column].push(DRAGON);
}

export function placeWall(G:any, location: Location, direction: Direction) {
  G.walls.push(new Wall(location, moveFrom(location, direction)));
}

export function createDragonPoo(G: any) {
  const dragonLocation = findDragonLocation(G.cells);
  if (dragonLocation) {
    G.pooTokens.push(new Poo(dragonLocation));
  }
}

export function pickUpPoo(G: any, playerID: string) {
  const playerLocation = findPlayerLocation(playerID, G.cells);
  if (playerLocation) {
    G.players[playerID].poo += _.remove(G.pooTokens, (poo: any) => _.isEqual((poo as Poo).location, playerLocation)).length;
  }
}

const game = {
  setup: setupGame,
  moves: { moveGoblin, enterBoard },
  turn: { moveLimit: 1 },
};

export default {
  game,
  debug: false,
  numPlayers: 2,
  multiplayer: { local: true },
};