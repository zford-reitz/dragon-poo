import {Card} from './Card';

export interface Player {
    entranceRows: number[];
    entranceColumns: number[];
    poo: number;
    hand: Card[];
}