import { Player } from "./Player";
import { Wall } from "./wall";
import { Poo } from "./poo";

interface PlayerMap {
    [key: string]: Player;
}

export interface GameState {
    players: PlayerMap;
    cells: string[][][];
    walls: Wall[];
    pooTokens: Poo[];
}