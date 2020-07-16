import { INVALID_MOVE } from 'boardgame.io/core';
import { Location } from './location';
import { Wall } from './wall';
import * as _ from 'lodash';
import { Ctx } from 'boardgame.io';
import { GameState, DragonDieColor } from './GameState';

type ColorDirections = {
  orange: Direction;
  blue: Direction;
  green: Direction;
  white: Direction;
  brown: undefined;
}

const DRAGON_DIE_COLORS: DragonDieColor[] = ['orange', 'blue', 'green', 'white', 'brown', 'brown'];
const DIRECTIONS_BY_COLOR: ColorDirections = {
  orange: "left",
  blue: "up",
  green: "right",
  white: "down",
  brown: undefined
};
export const DRAGON = "Dragon";

export type Direction = 'up' | 'down' | 'left' | 'right';

function moveFrom(startLocation: Location, direction: Direction): Location {
  switch (direction) {
    case 'up':
        return {row: startLocation.row - 1, column: startLocation.column};
    case 'down':
      return {row: startLocation.row + 1, column: startLocation.column};
    case 'left':
      return {row: startLocation.row, column: startLocation.column - 1};
    case 'right':
      return {row: startLocation.row, column: startLocation.column + 1};
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

export function setupGame() {
  // TODO zeb can't assume 4 players
  // TODO zeb let players choose color at start of game, rather than making it a part of setup

  const game: GameState = {
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
    cells: Array.from(Array(5), () => Array.from(Array(5), () => [] as string[])),
    walls: [],
    dragonDieRoll: 'brown'
  };

  game.cells[2][2].push(DRAGON);

  return game;
}

export function enterBoard(G: GameState, ctx: Ctx, row: number, column: number) {
  if (findPlayerLocation(ctx.currentPlayer, G.cells)) {
    return INVALID_MOVE;
  }
  
  let player = G.players[ctx.currentPlayer];
  if (
    player.entranceRows.includes(row) &&
    player.entranceColumns.includes(column) &&
    isValidMoveLocation(G, {row: row, column: column})
  ) {
    G.cells[row][column].push(ctx.currentPlayer);
    endTurn(G, ctx);
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
export function moveGoblin(G: GameState, ctx: Ctx, direction: Direction): undefined | typeof INVALID_MOVE {
  const initialLocation: Location | undefined = findPlayerLocation(ctx.currentPlayer, G.cells);

  if (!initialLocation) {
    return INVALID_MOVE;
  }

  const newLocation: Location = moveFrom(initialLocation, direction);
  if (!isValidMoveLocation(G, newLocation)) {
    return INVALID_MOVE;
  }

  _.remove(getPiecesAt(G, initialLocation), ctx.currentPlayer);
  getPiecesAt(G, newLocation).push(ctx.currentPlayer);
  
  endTurn(G, ctx);
}

export function removeFromLocation(G: GameState, location: Location, piece: string): void {
  _.pull(getPiecesAt(G, location), piece);
}

export function addToLocation(G: GameState, location: Location, piece: string): void {
  getPiecesAt(G, location).push(piece);
}

export function movePiece(G: GameState, piece: string, from?: Location, to?: Location): void {
  if (from) {
    removeFromLocation(G, from, piece);
  }

  if (to) {
    addToLocation(G, to, piece);
  }
}

function isLocationOnBoard(G: GameState, location: Location): boolean {
  return location.row >= 0 && G.cells.length > location.row
    && location.column >= 0 && G.cells[0].length > location.column;
}

function isValidMoveLocation(G: GameState, newLocation: Location): boolean {
  return isLocationOnBoard(G, newLocation) && !getPiecesAt(G, newLocation).includes(DRAGON);
}

export function findPlayerLocation(playerID: string, grid: string[][][]): Location | undefined {
  return findPiece(grid, playerID);
}

export function findDragonLocation(grid: string[][][]): Location | undefined {
  return findPiece(grid, DRAGON);
}

function findPiece(grid: string[][][], piece: string): Location | undefined {
  for (let row = 0; row < grid.length; row++) {
    for (let column = 0; column < grid[row].length; column++) {
      if (grid[row][column].includes(piece)) {
        return {row: row, column: column};
      }
    }
  }
}

export function moveDragon(G: GameState, direction: Direction) {
  const initialLocation: Location | undefined = findDragonLocation(G.cells);

  if (initialLocation) {
    const newLocation: Location = moveFrom(initialLocation, direction);
    const blockingWall = findBlockingWall(G, initialLocation, newLocation);
    if (blockingWall) {
      // don't move. eat wall instead.
      _.remove(G.walls, blockingWall);
    } else if (isLocationOnBoard(G, newLocation)) {
      _.pull(getPiecesAt(G, initialLocation), DRAGON);
      getPiecesAt(G, newLocation).push(DRAGON);
    } else {
      // go the other way instead
      const bounceDirection = bounce(direction);
      const bounceLocation = moveFrom(initialLocation, bounceDirection);
      _.pull(getPiecesAt(G, initialLocation), DRAGON);
      getPiecesAt(G, bounceLocation).push(DRAGON);
    }
  }

  // do we stomp anyone?
  const newDragonLocation = findDragonLocation(G.cells);
  if (newDragonLocation) {
    const cell = G.cells[newDragonLocation.row][newDragonLocation.column];
    _.remove(cell, e => e !== DRAGON && e !== "P").forEach((playerID: any) => {
      const player = G.players[playerID as number];
      for (var i = 0; i < player.poo; i++) {
        createDragonPoo(G);
      }
      player.poo = 0;
    });
  }
}

function findBlockingWall(G: GameState, initialLocation: Location, newLocation: Location): Wall | undefined {
  return _.find(G.walls, wall => wall.isBetween(initialLocation, newLocation));
}


export function unsafeMoveDragon(G: GameState, row: number, column: number) {
  movePiece(G, DRAGON, findDragonLocation(G.cells), {row: row, column: column});
}

export function placeWall(G: GameState, location: Location, direction: Direction) {
  G.walls.push(new Wall(location, moveFrom(location, direction)));
}

export function createDragonPoo(G: GameState) {
  const dragonLocation = findDragonLocation(G.cells);
  if (dragonLocation) {
    getPiecesAt(G, dragonLocation).push("P");
  }
}

export function pickUpPoo(G: GameState, playerID: string) {
  const playerLocation = findPlayerLocation(playerID, G.cells);
  if (playerLocation) {
    G.players[playerID].poo += _.remove(getPiecesAt(G, playerLocation), (piece: string) => piece === "P").length;
  }
}

export function rollDragonDie(G: GameState, ctx: Ctx) {
  const rolledNumber = ctx.random?.D6();
  
  if (rolledNumber) {
    G.dragonDieRoll = DRAGON_DIE_COLORS[rolledNumber - 1];
  }
}

function getPiecesAt(G: GameState, location: Location) {
  return G.cells[location.row][location.column];
}

function endTurn(G: GameState, ctx: Ctx) {
  pickUpPoo(G, ctx.currentPlayer);
  rollDragonDie(G, ctx);

  const dragonMoveDirection = DIRECTIONS_BY_COLOR[G.dragonDieRoll];
  if (dragonMoveDirection) {
    moveDragon(G, dragonMoveDirection);
  } else {
    createDragonPoo(G);
  }

  const events = ctx.events;
  if (events) {
    const endTurnFn = events.endTurn;
    if (endTurnFn) {
      endTurnFn();
    }
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