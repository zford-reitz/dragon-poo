import {setupGame, findPlayerLocation, removeFromLocation, pickUpPoo} from "./dragon-poo";
import {Poo} from "./poo";
import {Location} from './location';
import { GameState } from "./GameState";

it('player picks up no poo because there is no poo at their location', () => {
    const G = setupGame();
    movePlayerTo(G, "0", 2, 0);

    pickUpPoo(G, "0");

    expect(G.players[0].poo).toBe(0);
});

it('player picks up single poo at location', () => {
    const G = setupGame();
    movePlayerTo(G, "0", 2, 0);
    G.pooTokens.push(new Poo(new Location(2, 0)));
    G.pooTokens.push(new Poo(new Location(1, 0)));

    pickUpPoo(G, "0");

    expect(G.players[0].poo).toBe(1);
});

it('player picks up all poo at location', () => {
    const G = setupGame();
    movePlayerTo(G, "0", 2, 0);
    G.pooTokens.push(new Poo(new Location(2, 0)));
    G.pooTokens.push(new Poo(new Location(2, 0)));
    G.pooTokens.push(new Poo(new Location(2, 0)));
    G.pooTokens.push(new Poo(new Location(2, 0)));
    G.pooTokens.push(new Poo(new Location(1, 0)));

    pickUpPoo(G, "0");

    expect(G.players[0].poo).toBe(4);
});

function movePlayerTo(G: GameState, playerID: string, row: number, column: number) {
    const playerLocationBefore = findPlayerLocation(playerID, G.cells);
    if (playerLocationBefore) {
        G.cells[playerLocationBefore.row][playerLocationBefore.column] =
        removeFromLocation(G.cells[playerLocationBefore.row][playerLocationBefore.column], playerID);
    }

    G.cells[row][column].push(playerID);
}