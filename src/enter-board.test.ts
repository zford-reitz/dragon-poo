import {enterBoard, setupGame, unsafeMoveDragon, findPlayerLocation, removeFromLocation} from "./dragon-poo";
import { INVALID_MOVE } from "boardgame.io/core";
import { Ctx } from "boardgame.io";
import { GameState } from "./GameState";

it('left player enters in middle of left side', () => {
    const G = setupGame();
    enterBoard(G, {currentPlayer: "0"} as Ctx, 2, 0);

    expect(G.cells[2][0]).toBeTruthy();
});

it('left player enters at top of left side', () => {
    const G = setupGame();
    enterBoard(G, {currentPlayer: "0"} as Ctx, 1, 0);

    expect(G.cells[1][0]).toBeTruthy();
});

it('left player enters at bottom of left side', () => {
    const G = setupGame();
    enterBoard(G, {currentPlayer: "0"} as Ctx, 3, 0);

    expect(G.cells[3][0]).toBeTruthy();
});

it('player cannot enter corner', () => {
    const G = setupGame();
    const actualInvalidMove = enterBoard(G, {currentPlayer: "0"} as Ctx, 0, 0);

    expect(actualInvalidMove).toBe(INVALID_MOVE);
    expect(G.cells[0][0]).not.toContain("0");
});

it('player cannot enter if dragon is on square', () => {
    const G = setupGame();
    unsafeMoveDragon(G, 2, 0);
    const actualInvalidMove = enterBoard(G, {currentPlayer: "0"} as Ctx, 2, 0);

    expect(actualInvalidMove).toBe(INVALID_MOVE);
    expect(G.cells[2][0]).not.toContain("0");
});

it('top player cannot enter at top of left side', () => {
    const G = setupGame();
    const actualInvalidMove = enterBoard(G, {currentPlayer: "1"} as Ctx, 1, 0);
    
    expect(actualInvalidMove).toBe(INVALID_MOVE);
    expect(G.cells[1][0]).not.toContain("1");
});

it('player cannot enter the board if that player is already on the board', () => {
    const G = setupGame();
    const endTurnFn = jest.fn();

    positionPlayerAt(G, "0", 3, 0);
    const actualInvalidMove = enterBoard(G, {currentPlayer: "0"} as Ctx, 2, 0);
    
    expect(actualInvalidMove).toBe(INVALID_MOVE);
    expect(G.cells[2][0]).not.toContain("1");
    expect(endTurnFn.mock.calls.length).toBe(0);
});

function positionPlayerAt(G: GameState, playerID: string, row: number, column: number) {
    const playerLocationBefore = findPlayerLocation(playerID, G.cells);
    if (playerLocationBefore) {
        removeFromLocation(G, playerLocationBefore, playerID);
    }

    G.cells[row][column].push(playerID);
}