import {Card} from './Card';

export interface Player {
    entranceRows: number[];
    entranceColumns: number[];
    hand: Card[];
}