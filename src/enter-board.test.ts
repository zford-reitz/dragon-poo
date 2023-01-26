import {enterBoard, findPlayerLocation, removeFromLocation, setupKidGame, unsafeMoveDragon} from './dragon-poo';
import {INVALID_MOVE} from 'boardgame.io/core';
import {GameState} from './GameState';
import {EventsAPI} from 'boardgame.io/dist/types/src/plugins/events/events';

let G: GameState;
let events: EventsAPI
beforeEach(() => {
    G = setupKidGame(4);
    events = {
        endStage() {
        }
    } as EventsAPI;
});

it('left player enters in middle of left side', () => {
    enterBoard({G, events}, '0', 2, 0);

    expect(G.cells[2][0]).toBeTruthy();
});

it('left player enters at top of left side', () => {
    enterBoard({G, events}, '0', 1, 0);

    expect(G.cells[1][0]).toBeTruthy();
});

it('left player enters at bottom of left side', () => {
    enterBoard({G, events}, '0', 3, 0);

    expect(G.cells[3][0]).toBeTruthy();
});

it('player cannot enter corner', () => {
    const actualInvalidMove = enterBoard({G, events}, '0', 0, 0);

    expect(actualInvalidMove).toBe(INVALID_MOVE);
    expect(G.cells[0][0]).not.toContain('0');
});

it('player cannot enter if dragon is on square', () => {
    unsafeMoveDragon(G, 2, 0);
    const actualInvalidMove = enterBoard({G, events}, '0', 2, 0);

    expect(actualInvalidMove).toBe(INVALID_MOVE);
    expect(G.cells[2][0]).not.toContain('0');
});

it('top player cannot enter at top of left side', () => {
    const actualInvalidMove = enterBoard({G, events}, '1', 1, 0);

    expect(actualInvalidMove).toBe(INVALID_MOVE);
    expect(G.cells[1][0]).not.toContain('1');
});

it('player cannot enter the board if that player is already on the board', () => {
    const endStageFn = jest.fn();

    positionPlayerAt(G, '0', 3, 0);
    const actualInvalidMove = enterBoard({G, events}, '0', 2, 0);

    expect(actualInvalidMove).toBe(INVALID_MOVE);
    expect(G.cells[2][0]).not.toContain('1');
    expect(endStageFn.mock.calls.length).toBe(0);
});

function positionPlayerAt(G: GameState, playerID: string, row: number, column: number) {
    const playerLocationBefore = findPlayerLocation(playerID, G.cells);
    if (playerLocationBefore) {
        removeFromLocation(G, playerLocationBefore, playerID);
    }

    G.cells[row][column].push(playerID);
}