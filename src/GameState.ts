import { Player } from "./Player";
import { Wall } from "./wall";

interface PlayerMap {
    [key: string]: Player;
}

export type DragonDieColor = 'orange' | 'blue' | 'green' | 'white' | 'brown';

export interface GameState {
    players: PlayerMap;
    cells: string[][][];
    walls: Wall[];
    dragonDieRoll: DragonDieColor;
}