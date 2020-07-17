import { setupGame, findPlayerLocation, DRAGON, unsafeMoveDragon, moveGoblinInDirection, movePiece} from "./dragon-poo";
import { GameState } from "./GameState";
import { Ctx } from "boardgame.io";
import { INVALID_MOVE } from 'boardgame.io/core';
import { EventsAPI } from "boardgame.io/dist/types/src/plugins/events/events";

it('player moves one space up', () => {
    const G = setupGame();
    positionPlayerAt(G, "0", 2, 0);
    const endTurnFn = jest.fn();

    moveGoblinInDirection(G, {currentPlayer: "0", events: {endTurn: endTurnFn} as EventsAPI} as Ctx, 'up');

    expect(G.cells[2][0]).not.toContain("0");
    expect(G.cells[1][0]).toContain("0");
    expect(endTurnFn.mock.calls.length).toBe(1);
});

it('player moves one space right', () => {
    const G = setupGame();
    positionPlayerAt(G, "0", 2, 0);

    moveGoblinInDirection(G, {currentPlayer: "0"} as Ctx, 'right');

    expect(G.cells[2][0]).not.toContain("0");
    expect(G.cells[2][1]).toContain("0");
});

it('player fails to move off board by column', () => {
    const G = setupGame();
    positionPlayerAt(G, "0", 2, 4);

    const moveOffOfBoard = moveGoblinInDirection(G, {currentPlayer: "0"} as Ctx, 'right');

    expect(moveOffOfBoard).toBe(INVALID_MOVE);
    expect(G.cells[2][4]).toContain("0");
});

it('player fails to move off board by row', () => {
    const G = setupGame();
    positionPlayerAt(G, "0", 4, 2);

    const moveOffOfBoard = moveGoblinInDirection(G, {currentPlayer: "0"} as Ctx, 'down');

    expect(moveOffOfBoard).toBe(INVALID_MOVE);
    expect(G.cells[4][2]).toContain("0");
});

it('player moves into same space as other player', () => {
    const G = setupGame();
    positionPlayerAt(G, "0", 2, 0);
    positionPlayerAt(G, "1", 2, 1);

    moveGoblinInDirection(G, {currentPlayer: "0"} as Ctx, 'right');

    expect(G.cells[2][0]).not.toContain("0");
    // both players on same square
    expect(G.cells[2][1]).toContain("0");
    expect(G.cells[2][1]).toContain("1");
});

it('player cannot move into same space as dragon', () => {
    const G = setupGame();
    positionPlayerAt(G, "0", 2, 0);
    unsafeMoveDragon(G, 2, 1);

    const moveIntoDragonSpace = moveGoblinInDirection(G, {currentPlayer: "0"} as Ctx, 'right');

    expect(moveIntoDragonSpace).toBe(INVALID_MOVE);
    expect(G.cells[2][0]).toContain("0");
    expect(G.cells[2][1]).not.toContain("0");
    expect(G.cells[2][1]).toContain(DRAGON);
});

function positionPlayerAt(G: GameState, playerID: string, row: number, column: number) {
    movePiece(G, playerID, findPlayerLocation(playerID, G.cells), {row: row, column: column});
}