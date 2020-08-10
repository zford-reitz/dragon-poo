import {playCard} from "./dragon-poo";
import { GameState } from "./GameState";
import { Ctx } from "boardgame.io";
import { Card } from "./Card";
import { Player } from "./Player";
import { EventsAPI } from "boardgame.io/dist/types/src/plugins/events/events";

it('playing a card performs the effect of the card', () => {
    const toPlay: Card = {play: (G) => {}} as Card;

    const G: GameState = {
        players: {
            '0': {
                hand: [toPlay]
            } as Player
        },
        deck: [{}],
        discardPile: [],
        cells: [[[]]]
    } as unknown as GameState;
    const ctx: Ctx = {currentPlayer: '0', events: {endTurn: () => {}} as EventsAPI} as Ctx;
    const cardPlaySpy = jest.spyOn(toPlay, 'play');
    playCard(G, ctx, toPlay);

    expect(cardPlaySpy).toHaveBeenCalled();
});

it('playing a card moves that card to the discard pile', () => {
    const toPlay: Card = {title: '--GoesToDiscardPile--', play: (G) => {}} as Card;
    const G = {
        players: {
            '0': {
                hand: [toPlay]
            } as Player
        },
        deck: [{}],
        discardPile: [],
        cells: [[[]]]
    } as unknown as GameState;
    const ctx: Ctx = {currentPlayer: '0', events: {endTurn: () => {}} as EventsAPI} as Ctx;
    playCard(G, ctx, toPlay);

    expect(G.players['0'].hand).not.toContain(toPlay);
    expect(G.discardPile).toContain(toPlay);
});

it('playing a card draws a replacement card', () => {
    const toPlay: Card = {title: '--GoesToDiscardPile--', play: (G) => {}} as Card;
    const toDraw: Card = {title: '--DrawnFromDeck--'} as Card;
    
    const G = {
        players: {
            '0': {
                hand: [toPlay]
            } as Player
        },
        deck: [toDraw],
        discardPile: [],
        cells: [[[]]]
    } as unknown as GameState;
    const ctx: Ctx = {currentPlayer: '0', events: {endTurn: () => {}} as EventsAPI} as Ctx;
    playCard(G, ctx, toPlay);

    expect(G.players['0'].hand).toContain(toDraw);
    expect(G.deck.length).toBe(0);
});
