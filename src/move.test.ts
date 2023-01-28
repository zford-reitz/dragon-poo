import {DRAGON, findPlayerLocation, moveGoblin, movePiece, setupKidGame, unsafeMoveDragon} from './dragon-poo';
import {GameState} from './GameState';
import {INVALID_MOVE} from 'boardgame.io/core';
import {EventsAPI} from 'boardgame.io/dist/types/src/plugins/events/events';

let G: GameState;
let events: EventsAPI;
let endStageFn = jest.fn();

beforeEach(() => {
    endStageFn = jest.fn();
    G = setupKidGame(4);
    events = {endStage: endStageFn} as unknown as EventsAPI;
});

it('player moves one space up', () => {
    positionPlayerAt(G, '0', 2, 0);

    moveGoblin({G, events, playerID: '0'}, {row: 1, column: 0});

    expect(G.cells[2][0]).not.toContain('0');
    expect(G.cells[1][0]).toContain('0');
    expect(endStageFn.mock.calls.length).toBe(1);
});

it('player moves one space right', () => {
    positionPlayerAt(G, '0', 2, 0);

    moveGoblin({G, events, playerID: '0'}, {row: 2, column: 1});

    expect(G.cells[2][0]).not.toContain('0');
    expect(G.cells[2][1]).toContain('0');
});

it('player fails to move off board by column', () => {
    positionPlayerAt(G, '0', 2, 4);

    const moveOffOfBoard = moveGoblin({G, events, playerID: '0'}, {row: 2, column: 5});

    expect(moveOffOfBoard).toBe(INVALID_MOVE);
    expect(G.cells[2][4]).toContain('0');
});

it('player fails to move off board by row', () => {
    positionPlayerAt(G, '0', 4, 2);

    const moveOffOfBoard = moveGoblin({G, events, playerID: '0'}, {row: 5, column: 2});

    expect(moveOffOfBoard).toBe(INVALID_MOVE);
    expect(G.cells[4][2]).toContain('0');
});

it('player moves into same space as other player', () => {
    positionPlayerAt(G, '0', 2, 0);
    positionPlayerAt(G, '1', 2, 1);

    moveGoblin({G, events, playerID: '0'}, {row: 2, column: 1});

    expect(G.cells[2][0]).not.toContain('0');
    // both players on same square
    expect(G.cells[2][1]).toContain('0');
    expect(G.cells[2][1]).toContain('1');
});

it('player cannot move into same space as dragon', () => {
    positionPlayerAt(G, '0', 2, 0);
    unsafeMoveDragon(G, 2, 1);

    const moveIntoDragonSpace = moveGoblin({G, events, playerID: '0'}, {row: 2, column: 1});

    expect(moveIntoDragonSpace).toBe(INVALID_MOVE);
    expect(G.cells[2][0]).toContain('0');
    expect(G.cells[2][1]).not.toContain('0');
    expect(G.cells[2][1]).toContain(DRAGON);
});

it('player cannot move through a wall', () => {
    positionPlayerAt(G, '0', 2, 0);
    G.walls.push({from: {row: 2, column: 0}, to: {row: 2, column: 1}});

    const moveThroughWall = moveGoblin({G, events, playerID: '0'}, {row: 2, column: 1});

    expect(moveThroughWall).toBe(INVALID_MOVE);
    expect(G.cells[2][0]).toContain('0');
    expect(G.cells[2][1]).not.toContain('0');
});

function positionPlayerAt(G: GameState, playerID: string, row: number, column: number) {
    movePiece(G, playerID, findPlayerLocation(playerID, G.cells), {row: row, column: column});
}