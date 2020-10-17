import { GameState } from "./GameState";

export interface Card {
    title: string;
    text: string;

    play(G: GameState, cardContext?: any): void;
}