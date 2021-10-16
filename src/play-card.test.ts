import {playCard} from './dragon-poo';
import {GameState} from './GameState';
import {Ctx} from 'boardgame.io';
import {Card} from './Card';
import {Player} from './Player';
import {EventsAPI} from 'boardgame.io/dist/types/src/plugins/events/events';
import {INVALID_MOVE} from 'boardgame.io/core';

// TODO zeb this test doesn't test anything at the moment. make it possible to spy on or verify the card effect.
xit('playing a card performs the effect of the card', () => {
    const toPlay: Card = {} as Card;

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
    const ctx: Ctx = {
        currentPlayer: '0', events: {
            endTurn: () => {
            }
        } as EventsAPI
    } as Ctx;

    playCard(G, ctx, toPlay);

});

it('playing a card moves that card to the discard pile', () => {
    const toPlay: Card = {title: 'Bait'} as Card;
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
    const ctx: Ctx = {
        currentPlayer: '0', events: {
            endTurn: () => {
            }
        } as EventsAPI
    } as Ctx;
    playCard(G, ctx, toPlay);

    expect(G.players['0'].hand).not.toContain(toPlay);
    expect(G.discardPile).toContain(toPlay);
});

it('playing a card draws a replacement card', () => {
    const toPlay: Card = {title: 'Bait'} as Card;
    const toDraw: Card = {title: 'Bait'} as Card;

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
    const ctx: Ctx = {
        currentPlayer: '0', events: {
            endTurn: () => {
            }
        } as EventsAPI
    } as Ctx;
    playCard(G, ctx, toPlay);

    expect(G.players['0'].hand).toContain(toDraw);
    expect(G.deck.length).toBe(0);
});

it('trying to play a card that is not in your hand is an INVALID_MOVE', () => {
    const toPlay: Card = {title: '--NotActuallyInHand--'} as Card;
    const handFiller: Card = {title: '--InHandButNotPlayed--'} as Card;
    const G = {
        players: {
            '0': {
                hand: [handFiller]
            } as Player
        },
        deck: [],
        discardPile: [],
        cells: [[[]]]
    } as unknown as GameState;
    const ctx: Ctx = {
        currentPlayer: '0', events: {
            endTurn: () => {
            }
        } as EventsAPI
    } as Ctx;

    const playCardResult = playCard(G, ctx, toPlay);

    expect(playCardResult).toBe(INVALID_MOVE);
});