import {INVALID_MOVE} from 'boardgame.io/core';
import {Location} from './location';
import {Wall} from './wall';
import * as _ from 'lodash';
import {Ctx, PlayerID} from 'boardgame.io';
import {DragonDieColor, GameState, PlayerMap, PooMap} from './GameState';
import {Card} from './Card';
import {Player} from './Player';
import {possibleMoves} from './dragon-bait-pathing';
import {RandomAPI} from 'boardgame.io/dist/types/src/plugins/random/random';
import {EventsAPI} from 'boardgame.io/dist/types/src/plugins/events/events';

type ColorDirections = {
    orange: Direction;
    blue: Direction;
    green: Direction;
    white: Direction;
    brown: undefined;
}

const DRAGON_DIE_COLORS: DragonDieColor[] = ['orange', 'blue', 'green', 'white', 'brown', 'brown'];
const DIRECTIONS_BY_COLOR: ColorDirections = {
    orange: 'left',
    blue: 'up',
    green: 'right',
    white: 'down',
    brown: undefined
};
export const DRAGON = 'Dragon';
export const POO = 'P';
export const BAIT = 'Bait';
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

function setupPlayers(numberOfPlayers: number): PlayerMap {
    const playerOrange: Player = {
        entranceRows: [1, 2, 3],
        entranceColumns: [0],
        hand: []
    };

    const playerBlue: Player = {
        entranceRows: [0],
        entranceColumns: [1, 2, 3],
        hand: []
    };

    let players: PlayerMap = {
        '0': playerOrange,
        '1': playerBlue
    }

    if (numberOfPlayers > 2) {
        players['2'] = {
            entranceRows: [1, 2, 3],
            entranceColumns: [4],
            hand: []
        };
    }

    if (numberOfPlayers > 3) {
        players['3'] = {
            entranceRows: [4],
            entranceColumns: [1, 2, 3],
            hand: []
        };
    }

    return players;
}

function setupPoo(numberOfPlayers: number): PooMap {
    let pooCounts: PooMap = {
        '0': 0,
        '1': 0
    }

    if (numberOfPlayers > 2) {
        pooCounts['2'] = 0;
    }

    if (numberOfPlayers > 3) {
        pooCounts['3'] = 0;
    }

    return pooCounts;
}

export function setupKidGame(numberOfPlayers: number) {
    const game: GameState = {
        secret: {deck: []},
        players: setupPlayers(numberOfPlayers),
        cells: Array.from(Array(5), () => Array.from(Array(5), () => [] as string[])),
        walls: [],
        dragonDieRoll: 'brown',
        discardPile: [],
        deckSize: 0,
        pooCount: setupPoo(numberOfPlayers)
    };

    game.cells[2][2].push(DRAGON);

    return game;
}

export function setupGame(numberOfPlayers: number, random: RandomAPI) {
    let players = setupPlayers(numberOfPlayers);
    const game: GameState = {
        players: players,
        cells: Array.from(Array(5), () => Array.from(Array(5), () => [] as string[])),
        walls: [],
        dragonDieRoll: 'brown',
        secret: {
            deck: [],
        },
        discardPile: [],
        deckSize: 0,
        pooCount: setupPoo(numberOfPlayers)
    };

    game.secret.deck.push(...Array<Card>(6).fill({
        title: 'Bait',
        text: 'Place a Bait token on any Tile. The Dragon moves in the shortest path to Bait. When it gets there, remove Bait and replace it with Poo.',
    }));
    game.secret.deck.push(...Array<Card>(6).fill({
        title: 'Walls',
        text: 'Place a Wall between any Tile. Goblins cannot cross Walls. If the Dragon would cross a Wall, destroy the Wall instead.',
    }));
    game.secret.deck.push(...Array<Card>(4).fill({
        title: 'Scurry!',
        text: 'Move one space, even over a Wall.',
    }));
    game.secret.deck.push(...Array<Card>(4).fill({
        title: 'Smash Stuff!',
        text: 'Play this card to destroy any Poo or Wall on the Game Board',
    }));
    game.secret.deck.push({
        title: 'Hidey Hole',
        text: 'Play this card when the Dragon enters your Tile. You do not drop your Poo and run away. If the Dragon leaves the Tile before you do, gain 1 Poo.',
    });

    game.secret.deck = random.Shuffle(game.secret.deck);
    for (let playerId in game.players) {
        game.players[playerId].hand.push(..._.pullAt(game.secret.deck, 0, 1, 2));
    }
    game.deckSize = game.secret.deck.length;

    game.cells[2][2].push(DRAGON);

    return game;
}

function drawCard(G: GameState, random: RandomAPI, drawingPlayer: Player) {
    if (G.secret.deck.length === 0) {
        G.secret.deck.push(...random.Shuffle(G.discardPile));
        G.discardPile.length = 0;
    }

    drawingPlayer.hand.push(..._.pullAt(G.secret.deck, 0));
    G.deckSize = G.secret.deck.length;
}

export function canEnterBoard(game: { G: GameState }, playerId: PlayerID, row: number, column: number): boolean {
    const player = game.G.players[playerId];

    return !findPlayerLocation(playerId, game.G.cells) &&
        player.entranceRows.includes(row) &&
        player.entranceColumns.includes(column) &&
        isValidMoveLocation(game.G, {row: row, column: column});
}

export function enterBoard(game: { G: GameState, events: EventsAPI, playerID: PlayerID }, row: number, column: number): void | 'INVALID_MOVE' {
    if (canEnterBoard(game, game.playerID, row, column)) {
        game.G.cells[row][column].push(game.playerID);

        game.events.endStage();
    } else {
        return INVALID_MOVE;
    }
}

export function canScurryGoblin(G: GameState, initialLocation: Location | undefined, targetLocation: Location): boolean {
    return initialLocation !== undefined
        && isValidMoveLocation(G, targetLocation)
        && isOrthogonal(initialLocation, targetLocation);
}

export function scurryGoblin(game: { G: GameState, playerID: PlayerID, events: EventsAPI }, targetLocation: Location): undefined | typeof INVALID_MOVE {
    const initialLocation = findPlayerLocation(game.playerID, game.G.cells);

    if (!canScurryGoblin(game.G, initialLocation, targetLocation)) {
        return INVALID_MOVE;
    }

    movePiece(game.G, game.playerID, initialLocation, targetLocation);
}

export function canMoveGoblin(G: GameState, initialLocation: Location | undefined, targetLocation: Location): boolean {
    return initialLocation !== undefined
        && isValidMoveLocation(G, targetLocation)
        && isOrthogonal(initialLocation, targetLocation)
        && !findBlockingWall(G, initialLocation, targetLocation);
}

export function moveGoblin(game: { G: GameState, events: EventsAPI, playerID: PlayerID }, targetLocation: Location): undefined | typeof INVALID_MOVE {
    const initialLocation = findPlayerLocation(game.playerID, game.G.cells);

    if (!canMoveGoblin(game.G, initialLocation, targetLocation)) {
        return INVALID_MOVE;
    }

    movePiece(game.G, game.playerID, initialLocation, targetLocation);

    game.events.endStage!();
}

export function playCard(G: GameState, playerId: PlayerID, random: RandomAPI, events: EventsAPI, toPlay: Card) {
    const player = G.players[playerId];

    const indexOfCardInHand = _.findIndex(player.hand, {title: toPlay.title});
    if (indexOfCardInHand === -1) {
        return INVALID_MOVE;
    }

    const cardEffectResult = performCardEffect(G, toPlay);
    if (cardEffectResult === INVALID_MOVE) {
        return INVALID_MOVE;
    }

    player.hand.splice(indexOfCardInHand, 1);
    G.discardPile.push(toPlay);
    drawCard(G, random, player);
    endTurnForPlayer({G, random, events}, playerId);
}

export function buildWall(game: { G: GameState, ctx: Ctx, playerID: PlayerID, random: RandomAPI, events: EventsAPI }, cardContext: Wall): void | 'INVALID_MOVE' {
    const player = game.G.players[game.playerID];

    const indexOfCardInHand = _.findIndex(player.hand, {title: 'Walls'});
    if (indexOfCardInHand === -1) {
        return INVALID_MOVE;
    }

    game.G.walls.push(cardContext);

    game.G.discardPile.push(...player.hand.splice(indexOfCardInHand, 1));

    drawCard(game.G, game.random, player);
    endTurnForPlayer(game, game.playerID);
}

export function placeBait(game: { G: GameState, playerID: PlayerID, random: RandomAPI, events: EventsAPI }, location: Location): void | 'INVALID_MOVE' {
    const player = game.G.players[game.playerID];

    const indexOfCardInHand = _.findIndex(player.hand, {title: 'Bait'});
    if (indexOfCardInHand === -1) {
        return INVALID_MOVE;
    }

    game.G.cells[location.row][location.column].push(BAIT);

    game.G.discardPile.push(...player.hand.splice(indexOfCardInHand, 1));

    drawCard(game.G, game.random, player);
    endTurnForPlayer(game, game.playerID);
}

export function scurry(game: { G: GameState, playerID: PlayerID, random: RandomAPI, events: EventsAPI }, location: Location): void | 'INVALID_MOVE' {
    const player = game.G.players[game.playerID];

    const indexOfCardInHand = _.findIndex(player.hand, {title: 'Scurry!'});
    if (indexOfCardInHand === -1) {
        return INVALID_MOVE;
    }

    let scurryResult = scurryGoblin(game, location);
    if (scurryResult === INVALID_MOVE) {
        return INVALID_MOVE;
    }

    game.G.discardPile.push(...player.hand.splice(indexOfCardInHand, 1));

    drawCard(game.G, game.random, player);
    endTurnForPlayer(game, game.playerID);
}

export function smashStuff(game: { G: GameState, playerID: PlayerID, random: RandomAPI, events: EventsAPI }, location: Location, wallLocation?: Location): void | 'INVALID_MOVE' {
    const player = game.G.players[game.playerID];

    const indexOfCardInHand = _.findIndex(player.hand, {title: 'Smash Stuff!'});
    if (indexOfCardInHand === -1) {
        return INVALID_MOVE;
    }

    if (wallLocation) {
        // Smashing a Wall
        let toSmash = findBlockingWall(game.G, location, wallLocation);
        if (!toSmash) {
            return INVALID_MOVE;
        }
        _.remove(game.G.walls, toSmash);
    } else {
        // Smashing a Poo
        let pooIndex = _.indexOf(getPiecesAt(game.G, location), POO);
        if (pooIndex === -1) {
            return INVALID_MOVE;
        }
        _.pullAt(getPiecesAt(game.G, location), pooIndex);
    }

    game.G.discardPile.push(...player.hand.splice(indexOfCardInHand, 1));

    drawCard(game.G, game.random, player);
    endTurnForPlayer(game, game.playerID);
}

export function performCardEffect(G: GameState, played: Card) {
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

export function findDragonLocation(grid: string[][][]): Location {
    return findPiece(grid, DRAGON)!;
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

function findPieces(grid: string[][][], piece: string): Location[] {
    const locations: Location[] = [];
    for (let row = 0; row < grid.length; row++) {
        for (let column = 0; column < grid[row].length; column++) {
            if (grid[row][column].includes(piece)) {
                locations.push({row: row, column: column});
            }
        }
    }

    return locations;
}

export function moveDragon(G: GameState, direction: Direction) {
    const initialLocation = findDragonLocation(G.cells);

    if (initialLocation) {
        let newLocation = moveFrom(initialLocation, direction);
        const blockingWall = findBlockingWall(G, initialLocation, newLocation);
        if (blockingWall) {
            _.remove(G.walls, blockingWall);
        } else {
            if (!isLocationOnBoard(G, newLocation)) {
                newLocation = moveFrom(initialLocation, bounce(direction));
            }

            movePiece(G, DRAGON, initialLocation, newLocation);
        }
    }

    dragonEatsBait(G);

    // do we stomp anyone?
    const newDragonLocation = findDragonLocation(G.cells);
    if (newDragonLocation) {
        const cell = G.cells[newDragonLocation.row][newDragonLocation.column];
        _.remove(cell, e => e !== DRAGON && e !== POO)
            .forEach(player => dropPooAndRun(G, player));
    }
}

function dropPooAndRun(G: GameState, playerID: PlayerID): void {
    for (let i = 0; i < G.pooCount[playerID]; i++) {
        createDragonPoo(G);
    }

    G.pooCount[playerID] = 0;
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
        getPiecesAt(G, dragonLocation).push(POO);
    }
}

export function pickUpPoo(G: GameState, playerID: string) {
    const playerLocation = findPlayerLocation(playerID, G.cells);
    if (playerLocation) {
        G.pooCount[playerID] += _.remove(getPiecesAt(G, playerLocation), (piece: string) => piece === POO).length;
    }
}

export function rollDragonDie(G: GameState, random: RandomAPI) {
    const rolledNumber = random.D6();

    if (rolledNumber) {
        G.dragonDieRoll = DRAGON_DIE_COLORS[rolledNumber - 1];
    }
}

export function getPiecesAt(G: GameState, location: Location) {
    return G.cells[location.row][location.column];
}

export function endTurn(game: { G: GameState, ctx: Ctx, random: RandomAPI, events: EventsAPI }) {
    // TODO zeb this shouldn't directly end the turn
    //          instead, it should enter an "endTurn" sort of stage, where
    //          we determine Dragon movement based on Bait or Dragon Die Roll.
    //          that's where our current "onEndTurn" logic should also land
    triggerEndOfTurn(game.G, game.random, game.events, game.ctx.currentPlayer);
}

export function endTurnForPlayer(game: { G: GameState, random: RandomAPI, events: EventsAPI }, playerId: PlayerID) {
    // TODO zeb this shouldn't directly end the turn
    //          instead, it should enter an "endTurn" sort of stage, where
    //          we determine Dragon movement based on Bait or Dragon Die Roll.
    //          that's where our current "onEndTurn" logic should also land
    triggerEndOfTurn(game.G, game.random, game.events, playerId);
}

function dragonEatsBait(G: GameState) {
    const dragonLocation = findDragonLocation(G.cells);
    if (dragonLocation) {
        const cell = G.cells[dragonLocation.row][dragonLocation.column];
        _.pull(cell, BAIT);
    }
}

export function guideDragon(game: { G: GameState, events: EventsAPI }, targetLocation: Location): void | 'INVALID_MOVE' {
    const dragonLocation = findDragonLocation(game.G.cells);
    if (!isOrthogonal(dragonLocation, targetLocation)) {
        return INVALID_MOVE;
    }

    const possibleDirections = findDirectionsForShortestDragonPaths(game.G, findPieces(game.G.cells, BAIT));
    const guidedDirection = direction(dragonLocation, targetLocation);

    if (!possibleDirections.includes(guidedDirection)) {
        return INVALID_MOVE;
    }

    moveDragon(game.G, guidedDirection);
    game.events.endTurn();
}

function triggerEndOfTurn(G: GameState, random: RandomAPI, events: EventsAPI, playerId: PlayerID) {
    pickUpPoo(G, playerId);
    dragonEatsBait(G);

    const baitLocations = findPieces(G.cells, BAIT);

    if (_.isEmpty(baitLocations)) {
        rollDragonDie(G, random);

        const dragonMoveDirection = DIRECTIONS_BY_COLOR[G.dragonDieRoll];
        if (dragonMoveDirection) {
            moveDragon(G, dragonMoveDirection);
        } else {
            createDragonPoo(G);
        }
        events.endTurn();
    } else if (findPiece(G.cells, DRAGON)) {
        const possibleDirections = findDirectionsForShortestDragonPaths(G, baitLocations);
        if (possibleDirections.length === 1) {
            // we can move the Dragon without input from the player
            moveDragon(G, possibleDirections[0]);
            events.endTurn();
        } else {
            // we need input from the player
            events.setStage('guideDragon');
        }
    }
}

export function isBetween(wall: Wall, initialLocation: Location, newLocation: Location): boolean {
    return (_.isEqual(initialLocation, wall.from) && _.isEqual(newLocation, wall.to))
        || (_.isEqual(initialLocation, wall.to) && _.isEqual(newLocation, wall.from));
}

function findDirectionsForShortestDragonPaths(G: GameState, baitLocations: Location[]): Direction[] {
    const initialLocation = findPiece(G.cells, DRAGON)!;
    return possibleMoves(initialLocation, baitLocations, G.walls).map(l => direction(initialLocation, l));
}

export function direction(from: Location, to: Location) {
    if (from.row === to.row) {
        if (from.column > to.column) {
            return 'left';
        }

        return 'right';
    }

    if (from.row > to.row) {
        return 'up';
    }

    return 'down';
}
