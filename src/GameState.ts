import {Player} from './Player';
import {Wall} from './wall';
import {Card} from './Card';

export interface PlayerMap {
    [key: string]: Player;
}

export type DragonDieColor = 'orange' | 'blue' | 'green' | 'white' | 'brown';

export interface GameState {
    players: PlayerMap;
    cells: string[][][];
    walls: Wall[];
    dragonDieRoll: DragonDieColor;
    deck: Card[];
    discardPile: Card[];
}