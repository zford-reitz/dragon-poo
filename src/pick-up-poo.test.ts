import {findPlayerLocation, movePiece, pickUpPoo, setupGame} from "./dragon-poo";
import {GameState} from "./GameState";

it('player picks up no poo because there is no poo at their location', () => {
    const G = setupGame();
    movePlayerTo(G, "0", 2, 0);

    pickUpPoo(G, "0");

    expect(G.players[0].poo).toBe(0);
});

it('player picks up single poo at location', () => {
    const G = setupGame();
    movePlayerTo(G, "0", 2, 0);
    G.cells[2][0].push("P");
    G.cells[1][0].push("P");

    pickUpPoo(G, "0");

    expect(G.players[0].poo).toBe(1);
});

it('player picks up all poo at location', () => {
    const G = setupGame();
    movePlayerTo(G, "0", 2, 0);
    G.cells[2][0].push("P");
    G.cells[2][0].push("P");
    G.cells[2][0].push("P");
    G.cells[2][0].push("P");
    G.cells[1][0].push("P");

    pickUpPoo(G, "0");

    expect(G.players[0].poo).toBe(4);
});

function movePlayerTo(G: GameState, playerID: string, row: number, column: number) {
    movePiece(G, playerID, findPlayerLocation(playerID, G.cells), {row: row, column: column});
}