import { Player } from "./Player";
import { Wall } from "./wall";
import { Poo } from "./poo";

interface PlayerMap {
    [key: string]: Player;
}

export type DragonDieColor = 'orange' | 'blue' | 'green' | 'white' | 'brown';

export interface GameState {
    players: PlayerMap;
    cells: string[][][];
    walls: Wall[];
    pooTokens: Poo[];
    dragonDieRoll: DragonDieColor;
}