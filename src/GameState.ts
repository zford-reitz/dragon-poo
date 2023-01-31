import {Player} from './Player';
import {Wall} from './wall';
import {Card} from './Card';

export interface PlayerMap {
    [key: string]: Player;
}

export interface PooMap {
    [key: string]: number;
}

export interface HidingMap {
    [key: string]: boolean;
}

export type DragonDieColor = 'orange' | 'blue' | 'green' | 'white' | 'brown';

export interface GameState {
    players: PlayerMap;
    cells: string[][][];
    walls: Wall[];
    dragonDieRoll: DragonDieColor;
    secret: {
        deck: Card[];
    };
    discardPile: Card[];
    deckSize: number;
    pooCount: PooMap;
    hidingMap: HidingMap;
    currentPlayer: { mustMove?: boolean, mustPlayCard?: boolean };
}