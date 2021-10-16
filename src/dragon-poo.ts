import { INVALID_MOVE } from 'boardgame.io/core';
import { Location } from './location';
import { Wall } from './wall';
import * as _ from 'lodash';
import { Ctx } from 'boardgame.io';
import { GameState, DragonDieColor, PlayerMap } from './GameState';
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

function setupPlayers(ctx: Ctx): PlayerMap {
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

  let players: PlayerMap = {
    "0": playerOrange,
    "1": playerBlue
  }

    if (ctx?.numPlayers > 2) {
        const playerGreen: Player = {
            entranceRows: [1, 2, 3],
            entranceColumns: [4],
            poo: 0,
            hand: []
        };
        players["2"] = playerGreen;
    }

    if (ctx?.numPlayers > 3) {
        const playerWhite: Player = {
            entranceRows: [4],
            entranceColumns: [1, 2, 3],
            poo: 0,
            hand: []
        };
        players["3"] = playerWhite;
    }

  return players;
}

export function setupKidGame(ctx?: Ctx) {
  const game: GameState = {
    players: setupPlayers(ctx!),
    cells: Array.from(Array(5), () => Array.from(Array(5), () => [] as string[])),
    walls: [],
    dragonDieRoll: 'brown',
    deck: [],
    discardPile: []
  };

  game.cells[2][2].push(DRAGON);

  return game;
}

export function setupGame(ctx?: Ctx) {
  const game: GameState = {
    players: setupPlayers(ctx!),
    cells: Array.from(Array(5), () => Array.from(Array(5), () => [] as string[])),
    walls: [],
    dragonDieRoll: 'brown',
    deck: [],
    discardPile: []
  };

  game.deck.push(...Array<Card>(6).fill({
    title: 'Bait', 
    text: 'Place a Bait token on any Tile. The Dragon moves in the shortest path to Bait. When it gets there, remove Bait and replace it with Poo.',
  }));
  game.deck.push(...Array<Card>(6).fill({
    title: 'Walls', 
    text: 'Place a Wall between any Tile. Goblins cannot cross Walls. If the Dragon would cross a Wall, destroy the Wall instead.',
  }));
  game.deck.push(...Array<Card>(4).fill({
    title: 'Scurry!', 
    text: 'Move one space, even over a Wall.',
  }));
  game.deck.push(...Array<Card>(4).fill({
    title: 'Smash Stuff!', 
    text: 'Play this card to destroy any Poo or Wall on the Game Board',
  }));
  game.deck.push({
    title: 'Hidey Hole', 
    text: 'Play this card when the Dragon enters your Tile. You do not drop your Poo and run away. If the Dragon leaves the Tile before you do, gain 1 Poo.',
  });
  
  if (ctx) {
    game.deck = ctx.random!.Shuffle(game.deck);
  }

  for (let playerId in game.players) {
    game.players[playerId].hand.push(..._.pullAt(game.deck, 0, 1, 2));
  }

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

export function canEnterBoard(G: GameState, ctx: Ctx, row: number, column: number): boolean {
  const player = G.players[ctx.currentPlayer];
    
  return !findPlayerLocation(ctx.currentPlayer, G.cells) &&
    player.entranceRows.includes(row) &&
    player.entranceColumns.includes(column) &&
    isValidMoveLocation(G, {row: row, column: column});
}

export function enterBoard(G: GameState, ctx: Ctx, row: number, column: number) {
  if (canEnterBoard(G, ctx, row, column)) {
    G.cells[row][column].push(ctx.currentPlayer);
    
    ctx.events!.endStage!();
  } else {
      return INVALID_MOVE;
  }
}

export function canMoveGoblin(G: GameState, initialLocation: Location | undefined, targetLocation: Location): boolean {
  return initialLocation !== undefined
    && isValidMoveLocation(G, targetLocation)
    && isOrthogonal(initialLocation, targetLocation)
    && !findBlockingWall(G, initialLocation, targetLocation);
}

export function moveGoblin(G: GameState, ctx: Ctx, targetLocation: Location): undefined | typeof INVALID_MOVE {
  const initialLocation = findPlayerLocation(ctx.currentPlayer, G.cells);

  if (!canMoveGoblin(G, initialLocation, targetLocation)) {
    return INVALID_MOVE;
  }
  
  movePiece(G, ctx.currentPlayer, initialLocation, targetLocation);
  
  ctx.events!.endStage!();
}

export function playCard(G: GameState, ctx: Ctx, toPlay: Card, cardContext?: any) {
  const player = G.players[ctx.currentPlayer];

  const indexOfCardInHand = _.findIndex(player.hand, {title: toPlay.title});
  if (indexOfCardInHand === -1) {
    return INVALID_MOVE;
  }

  const cardEffectResult = performCardEffect(G, toPlay, cardContext);
  if (cardEffectResult === INVALID_MOVE) {
    return INVALID_MOVE;
  }

  player.hand.splice(indexOfCardInHand, 1);
  G.discardPile.push(toPlay);
  drawCard(G, ctx, player);
  endTurn(G, ctx);
}

export function buildWall(G: GameState, ctx: Ctx, cardContext: Wall) {
    const player = G.players[ctx.currentPlayer];

    const indexOfCardInHand = _.findIndex(player.hand, {title: 'Walls'});
    if (indexOfCardInHand === -1) {
        return INVALID_MOVE;
    }

    G.walls.push(cardContext);

    G.discardPile.push(...player.hand.splice(indexOfCardInHand, 1));

    drawCard(G, ctx, player);
    endTurn(G, ctx);
}

export function performCardEffect(G: GameState, played: Card, cardContext?: any) {
    switch (played.title) {
        case 'Bait':
            break;
        case 'Scurry!':
            break;
        case 'Smash Stuff!':
            break;
        case 'Hidey Hole':
            break;
        default:
            return INVALID_MOVE;
    }
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
        _.remove(cell, e => e !== DRAGON && e !== 'P')
            .map(playerId => G.players[playerId])
            .forEach(player => dropPooAndRun(G, player));
    }
}

function dropPooAndRun(G: GameState, player: Player): void {
    for (var i = 0; i < player.poo; i++) {
        createDragonPoo(G);
    }

    player.poo = 0;
}

export function findBlockingWall(G: GameState, initialLocation: Location, newLocation: Location): Wall | undefined {
  return _.find(G.walls, wall => isBetween(wall, initialLocation, newLocation));
}


export function unsafeMoveDragon(G: GameState, row: number, column: number) {
  movePiece(G, DRAGON, findDragonLocation(G.cells), {row: row, column: column});
}

export function placeWall(G: GameState, location: Location, direction: Direction) {
  G.walls.push({from: location, to: moveFrom(location, direction)});
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
  ctx.events!.endTurn!();
}

export function onEndTurn(G: GameState, ctx: Ctx) {
  pickUpPoo(G, ctx.currentPlayer);
  rollDragonDie(G, ctx);

  const dragonMoveDirection = DIRECTIONS_BY_COLOR[G.dragonDieRoll];
  if (dragonMoveDirection) {
    moveDragon(G, dragonMoveDirection);
  } else {
    createDragonPoo(G);
  }
}

export function isBetween(wall: Wall, initialLocation: Location, newLocation: Location): boolean {
  return (_.isEqual(initialLocation, wall.from) && _.isEqual(newLocation, wall.to)) 
      || (_.isEqual(initialLocation, wall.to) && _.isEqual(newLocation, wall.from));
}
