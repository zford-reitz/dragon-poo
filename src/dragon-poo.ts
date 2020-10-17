import { INVALID_MOVE } from 'boardgame.io/core';
import { Location } from './location';
import { Wall } from './wall';
import * as _ from 'lodash';
import { Ctx } from 'boardgame.io';
import { GameState, DragonDieColor } from './GameState';
import { Card } from './Card';
import { Player } from './Player';

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

export function moveFrom(startLocation: Location, direction: Direction): Location {
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

export function setupGame(ctx?: Ctx) {
  // TODO zeb can't assume 4 players
  // TODO zeb let players choose color at start of game, rather than making it a part of setup

  const playerOrange: Player = {
    entranceRows: [1, 2, 3],
    entranceColumns: [0],
    poo: 0,
    hand: []
  };
  const playerBlue: Player = {
    entranceRows: [0],
    entranceColumns: [1, 2, 3],
    poo: 0,
    hand: []
  };

  const game: GameState = {
    players: {
      "0": playerOrange,
      "1": playerBlue
    },
    cells: Array.from(Array(5), () => Array.from(Array(5), () => [] as string[])),
    walls: [],
    dragonDieRoll: 'brown',
    deck: [],
    discardPile: []
  };

  game.deck.push(...Array<Card>(5).fill({
    title: 'Bait', 
    text: 'Place a Bait token on any Tile. The Dragon moves in the shortest path to Bait. When it gets there, remove Bait and replace it with Poo.',
    play: (G) => {}}));
  game.deck.push(...Array<Card>(6).fill({
    title: 'Walls', 
    text: 'Place a Wall between any Tile. Goblins cannot cross Walls. If the Dragon would cross a Wall, destroy the Wall instead.',
    play: (G, cardContext) => {G.walls.push(new Wall(cardContext.from, cardContext.to))}
  }));
  game.deck.push(...Array<Card>(4).fill({
    title: 'Catapult', 
    text: 'Place a Catapult token anywhere on the board. If the Dragon or a Goblin is in the same Tile as a Catapult, it is moved in the direction of the Catapult&apos;s color.',
    play: (G) => {}}));
  game.deck.push(...Array<Card>(4).fill({
    title: 'Big Hammer', 
    text: 'Play this card to destroy any Poo, Wall, or Catapult on the Table',
    play: (G) => {}}));
  game.deck.push({
    title: 'Hidey Hole', 
    text: 'Play this card when the Dragon enters your Tile. You do not drop your Poo and run away. If the Dragon leaves the Tile before you do, gain 1 Poo.',
    play: (G) => {}});
  
  if (ctx) {
    game.deck = ctx.random!.Shuffle(game.deck);
  }

  playerOrange.hand.push(..._.pullAt(game.deck, 0, 1, 2));
  playerBlue.hand.push(..._.pullAt(game.deck, 0, 1, 2));

  game.cells[2][2].push(DRAGON);

  return game;
}

function drawCard(G: GameState, ctx: Ctx, drawingPlayer: Player) {
  if (G.deck.length === 0) {
    G.deck = ctx.random!.Shuffle(G.discardPile);
    G.discardPile = [];
  }

  drawingPlayer.hand.push(..._.pullAt(G.deck, 0));
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
    
    ctx.events!.endStage!();
  } else {
      return INVALID_MOVE;
  }
}

export function moveGoblin(G: GameState, ctx: Ctx, newLocation: Location): undefined | typeof INVALID_MOVE {
  const initialLocation = findPlayerLocation(ctx.currentPlayer, G.cells);

  if (!initialLocation) {
    return INVALID_MOVE;
  }
  
  if (!isValidMoveLocation(G, newLocation)) {
    return INVALID_MOVE;
  }

  if (!isOrthogonal(initialLocation, newLocation)) {
    return INVALID_MOVE;
  }  

  if (findBlockingWall(G, initialLocation, newLocation)) {
    return INVALID_MOVE;
  }

  movePiece(G, ctx.currentPlayer, initialLocation, newLocation);
  
  ctx.events!.endStage!();
}

export function playCard(G: GameState, ctx: Ctx, toPlay: Card, cardContext?: any) {
  const player = G.players[ctx.currentPlayer];

  toPlay.play(G, cardContext);

  player.hand.splice(_.findIndex(player.hand, {title: toPlay.title}), 1);
  G.discardPile.push(toPlay);
  drawCard(G, ctx, player);
  endTurn(G, ctx);
}

export function isOrthogonal(a: Location, b: Location): boolean {
  const rowDiff = Math.abs(a.row - b.row);
  const columnDiff = Math.abs(a.column - b.column);

  return (rowDiff === 0 && columnDiff === 1) || (rowDiff === 1 && columnDiff === 0);
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
  const initialLocation = findDragonLocation(G.cells);

  if (initialLocation) {
    var newLocation = moveFrom(initialLocation, direction);
    const blockingWall = findBlockingWall(G, initialLocation, newLocation);
    if (blockingWall) {
      _.remove(G.walls, blockingWall);
    } else  {
      if (!isLocationOnBoard(G, newLocation)) {
        newLocation = moveFrom(initialLocation, bounce(direction));
      } 

      movePiece(G, DRAGON, initialLocation, newLocation);
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

export function findBlockingWall(G: GameState, initialLocation: Location, newLocation: Location): Wall | undefined {
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

export function endTurn(G: GameState, ctx: Ctx) {
  pickUpPoo(G, ctx.currentPlayer);
  rollDragonDie(G, ctx);

  const dragonMoveDirection = DIRECTIONS_BY_COLOR[G.dragonDieRoll];
  if (dragonMoveDirection) {
    moveDragon(G, dragonMoveDirection);
  } else {
    createDragonPoo(G);
  }

  ctx.events!.endTurn!();
}
