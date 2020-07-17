import {moveDragon, setupGame, findPlayerLocation, DRAGON, unsafeMoveDragon, placeWall, createDragonPoo, findDragonLocation, movePiece} from "./dragon-poo";
import * as _ from "lodash";
import { GameState } from "./GameState";

it('dragon moves one space left', () => {
    const G = setupGame();

    moveDragon(G, 'left');

    expect(G.cells[2][2]).not.toContain(DRAGON);
    expect(G.cells[2][1]).toContain(DRAGON);
});

it('dragon bounces off of edge of board', () => {
    const G = setupGame();

    unsafeMoveDragon(G, 1, 0);
    moveDragon(G, 'left');

    expect(G.cells[1][0]).not.toContain(DRAGON);
    expect(G.cells[1][1]).toContain(DRAGON);
});

it('dragon stays in initial location if wall is encountered', () => {
    const G = setupGame();

    placeWall(G, {row: 2, column: 2}, 'down');
    moveDragon(G, 'down');

    expect(G.cells[2][2]).toContain(DRAGON);
});

it('dragon eats wall if wall is encountered', () => {
    const G = setupGame();

    placeWall(G, {row: 2, column: 2}, 'down');
    moveDragon(G, 'down');

    expect(G.walls).toEqual([]);
});

it('dragon poos on command', () => {
    const G = setupGame();

    createDragonPoo(G);

    const dragonLocation = findDragonLocation(G.cells)!;
    expect(G.cells[dragonLocation.row][dragonLocation.column]).toContain("P");
});

// TODO zeb if player is on target tile, that player is moved to their starting zone and all of their poo is placed on that tile
it('dragon stomps on player, causing player to move back to starting zone and drop all poo', () => {
    const G = setupGame();
    G.players["0"].poo = 3;
    movePlayerTo(G, "0", 3, 2);
    const playerLocation = {row: 3, column: 2};
    moveDragon(G, 'down');

    expect(G.cells[3][2]).toContain(DRAGON);
    expect(G.cells[3][2]).not.toContain("0");
    expect(findPlayerLocation("0", G.cells)).toBeFalsy();
    expect(_.flattenDeep(G.cells).filter(piece => piece === "P").length).toBe(3);
    expect(_.filter(G.cells[playerLocation.row][playerLocation.column].filter(piece => piece === "P")).length).toBe(3);
});

function movePlayerTo(G: GameState, playerID: string, row: number, column: number) {
    movePiece(G, playerID, findPlayerLocation(playerID, G.cells), {row: row, column: column});
}