import {move, setupGame, findPlayerLocation, DRAGON, findDragonLocation, removeFromLocation, unsafeMoveDragon, moveGoblin} from "./dragon-poo";
import { INVALID_MOVE } from "boardgame.io/dist/core";

it('player moves one space up', () => {
    const G = setupGame();
    movePlayer(G, "0", 2, 0);

    moveGoblin(G, {playerID: "0"}, 'up');

    expect(G.cells[2][0]).not.toContain("0");
    expect(G.cells[1][0]).toContain("0");
});

it('player moves one space right', () => {
    const G = setupGame();
    movePlayer(G, "0", 2, 0);

    moveGoblin(G, {playerID: "0"}, 'right');

    expect(G.cells[2][0]).not.toContain("0");
    expect(G.cells[2][1]).toContain("0");
});

it('player fails to move off board by column', () => {
    const G = setupGame();
    movePlayer(G, "0", 2, 4);

    moveGoblin(G, {playerID: "0"}, 'right');

    expect(G.cells[2][4]).toContain("0");
});

it('player fails to move off board by row', () => {
    const G = setupGame();
    movePlayer(G, "0", 4, 2);

    moveGoblin(G, {playerID: "0"}, 'down');

    expect(G.cells[4][2]).toContain("0");
});

it('player moves into same space as other player', () => {
    const G = setupGame();
    movePlayer(G, "0", 2, 0);
    movePlayer(G, "1", 2, 1);

    moveGoblin(G, {playerID: "0"}, 'right');

    expect(G.cells[2][0]).not.toContain("0");
    // both players on same square
    expect(G.cells[2][1]).toContain("0");
    expect(G.cells[2][1]).toContain("1");
});

it('player cannot move into same space as dragon', () => {
    const G = setupGame();
    movePlayer(G, "0", 2, 0);
    unsafeMoveDragon(G, 2, 1);

    moveGoblin(G, {playerID: "0"}, 'right');

    expect(G.cells[2][0]).toContain("0");
    expect(G.cells[2][1]).not.toContain("0");
    expect(G.cells[2][1]).toContain(DRAGON);
});

function movePlayer(G, playerID, row, column) {
    const playerLocationBefore = findPlayerLocation(playerID, G.cells);
    if (playerLocationBefore) {
        G.cells[playerLocationBefore.row][playerLocationBefore.column] =
        removeFromLocation(G.cells[playerLocationBefore.row][playerLocationBefore.column], playerID);
    }

    G.cells[row][column].push(playerID);
}