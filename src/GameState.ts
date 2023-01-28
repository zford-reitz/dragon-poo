import {Player} from './Player';
import {Wall} from './wall';
import {Card} from './Card';

export interface PlayerMap {
    [key: string]: Player;
}

export interface PooMap {
    [key: string]: number;
}

export type DragonDieColor = 'orange' | 'blue' | 'green' | 'white' | 'brown';

export interface GameState {
    players: PlayerMap;
    cells: string[][][];
    walls: Wall[];
    dragonDieRoll: DragonDieColor;
    deck: Card[];
    discardPile: Card[];
    pooCount: PooMap
}