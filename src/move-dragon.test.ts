import {moveDragon, setupGame, findPlayerLocation, DRAGON, removeFromLocation, unsafeMoveDragon, placeWall, createDragonPoo} from "./dragon-poo";
import { Location } from "./location";
import {filter, isEqual} from "lodash";

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

    placeWall(G, new Location(2, 2), 'down');
    moveDragon(G, 'down');

    expect(G.cells[2][2]).toContain(DRAGON);
});

it('dragon eats wall if wall is encountered', () => {
    const G = setupGame();

    placeWall(G, new Location(2, 2), 'down');
    moveDragon(G, 'down');

    expect(G.walls).toEqual([]);
});

it('dragon poos on command', () => {
    const G = setupGame();

    createDragonPoo(G);

    expect(G.pooTokens[0].location).toEqual(new Location(2, 2));
});

// TODO zeb if player is on target tile, that player is moved to their starting zone and all of their poo is placed on that tile
it('dragon stomps on player, causing player to move back to starting zone and drop all poo', () => {
    const G = setupGame();
    G.players["0"].poo = 3;
    movePlayerTo(G, "0", 3, 2);
    const playerLocation = new Location(3, 2);
    moveDragon(G, 'down');

    expect(G.cells[3][2]).toContain(DRAGON);
    expect(G.cells[3][2]).not.toContain("0");
    expect(findPlayerLocation("0", G.cells)).toBeFalsy();
    expect(G.pooTokens.length).toBe(3);
    expect(filter(G.pooTokens, (poo) => isEqual(poo.location, playerLocation)).length).toBe(3);
});

function movePlayerTo(G, playerID, row, column) {
    const playerLocationBefore = findPlayerLocation(playerID, G.cells);
    if (playerLocationBefore) {
        G.cells[playerLocationBefore.row][playerLocationBefore.column] =
        removeFromLocation(G.cells[playerLocationBefore.row][playerLocationBefore.column], playerID);
    }

    G.cells[row][column].push(playerID);
}