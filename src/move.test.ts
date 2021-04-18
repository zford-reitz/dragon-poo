import { setupGame, findPlayerLocation, DRAGON, unsafeMoveDragon, moveGoblin, movePiece} from "./dragon-poo";
import { GameState } from "./GameState";
import { Ctx } from "boardgame.io";
import { INVALID_MOVE } from 'boardgame.io/core';
import { EventsAPI } from "boardgame.io/dist/types/src/plugins/events/events";
import { Wall } from "./wall";

it('player moves one space up', () => {
    const G = setupGame();
    positionPlayerAt(G, "0", 2, 0);
    const endStageFn = jest.fn();

    moveGoblin(G, {currentPlayer: "0", events: {endStage: endStageFn} as EventsAPI} as Ctx, {row: 1, column: 0});

    expect(G.cells[2][0]).not.toContain("0");
    expect(G.cells[1][0]).toContain("0");
    expect(endStageFn.mock.calls.length).toBe(1);
});

it('player moves one space right', () => {
    const G = setupGame();
    positionPlayerAt(G, "0", 2, 0);

    moveGoblin(G, createCtx("0"), {row: 2, column: 1});

    expect(G.cells[2][0]).not.toContain("0");
    expect(G.cells[2][1]).toContain("0");
});

it('player fails to move off board by column', () => {
    const G = setupGame();
    positionPlayerAt(G, "0", 2, 4);

    const moveOffOfBoard = moveGoblin(G, createCtx("0"), {row: 2, column: 5});

    expect(moveOffOfBoard).toBe(INVALID_MOVE);
    expect(G.cells[2][4]).toContain("0");
});

it('player fails to move off board by row', () => {
    const G = setupGame();
    positionPlayerAt(G, "0", 4, 2);

    const moveOffOfBoard = moveGoblin(G, createCtx("0"), {row: 5, column: 2});

    expect(moveOffOfBoard).toBe(INVALID_MOVE);
    expect(G.cells[4][2]).toContain("0");
});

it('player moves into same space as other player', () => {
    const G = setupGame();
    positionPlayerAt(G, "0", 2, 0);
    positionPlayerAt(G, "1", 2, 1);

    moveGoblin(G, createCtx("0"), {row: 2, column: 1});

    expect(G.cells[2][0]).not.toContain("0");
    // both players on same square
    expect(G.cells[2][1]).toContain("0");
    expect(G.cells[2][1]).toContain("1");
});

it('player cannot move into same space as dragon', () => {
    const G = setupGame();
    positionPlayerAt(G, "0", 2, 0);
    unsafeMoveDragon(G, 2, 1);

    const moveIntoDragonSpace = moveGoblin(G, createCtx("0"), {row: 2, column: 1});

    expect(moveIntoDragonSpace).toBe(INVALID_MOVE);
    expect(G.cells[2][0]).toContain("0");
    expect(G.cells[2][1]).not.toContain("0");
    expect(G.cells[2][1]).toContain(DRAGON);
});

it('player cannot move through a wall', () => {
    const G = setupGame();
    positionPlayerAt(G, "0", 2, 0);
    G.walls.push({from: {row: 2, column: 0}, to: {row: 2, column: 1}});

    const moveThroughWall = moveGoblin(G, createCtx("0"), {row: 2, column: 1});

    expect(moveThroughWall).toBe(INVALID_MOVE);
    expect(G.cells[2][0]).toContain("0");
    expect(G.cells[2][1]).not.toContain("0");
});

function createCtx(currentPlayer: string): Ctx {
    return {currentPlayer: currentPlayer, events: {endStage: () => {}}} as Ctx;
}

function positionPlayerAt(G: GameState, playerID: string, row: number, column: number) {
    movePiece(G, playerID, findPlayerLocation(playerID, G.cells), {row: row, column: column});
}