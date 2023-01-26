import {placeBait} from './dragon-poo';
import {GameState} from './GameState';
import {Card} from './Card';
import {Player} from './Player';
import {EventsAPI} from 'boardgame.io/dist/types/src/plugins/events/events';
import {INVALID_MOVE} from 'boardgame.io/core';
import _ from 'lodash';
import {RandomAPI} from "boardgame.io/dist/types/src/plugins/random/random";

let G: GameState;
let events: EventsAPI;
let random: RandomAPI;

beforeEach(() => {
    let game = setupBoardWithMultipleBaitCardsInHand();
    G = game.G;
    events = game.events;
    random = game.random;
});

it('placing Bait moves a Bait card from Player\'s hand to the discard pile', () => {

    const beforeNumberOfBaitCardsInHand = _.filter(G.players['0'].hand, isBait).length;
    const beforeNumberOfBaitCardsInDiscardPile = _.filter(G.discardPile, isBait).length;

    placeBait(G, random, events, '0', irrelevantLocation());

    const afterNumberOfBaitCardsInHand = _.filter(G.players['0'].hand, isBait).length;
    const afterNumberOfBaitCardsInDiscardPile = _.filter(G.discardPile, isBait).length;

    expect(afterNumberOfBaitCardsInHand)
        .toEqual(beforeNumberOfBaitCardsInHand - 1);

    expect(afterNumberOfBaitCardsInDiscardPile)
        .toEqual(beforeNumberOfBaitCardsInDiscardPile + 1);
});

function irrelevantLocation() {
    return {row: 1, column: 1};
}

it('placing Bait draws a replacement card', () => {
    const toDraw = G.deck[0];

    placeBait(G, random, events, '0', irrelevantLocation());

    expect(G.players['0'].hand).toContain(toDraw);
    expect(G.deck.length).toBe(0);
});

it('trying to place Bait without a Bait Card in hand is an INVALID_MOVE', () => {
    const handFiller: Card = {title: '--InHandButNotPlayed--'} as Card;
    G.players['0'].hand = [handFiller];

    const playCardResult = placeBait(G, random, events, '0', irrelevantLocation());

    expect(playCardResult).toBe(INVALID_MOVE);
});

it('placing Bait places a Bait token on the selected tile', () => {

    placeBait(G, random, events, '0', {row: 4, column: 2});

    expect(G.cells[4][2]).toContain('Bait');
});

function setupBoardWithMultipleBaitCardsInHand() {
    const toDraw: Card = {title: '--LastCardInDeck--'} as Card;

    const G = {
        players: {
            '0': {
                hand: [{title: 'Bait'} as Card, {title: 'Bait'} as Card]
            } as Player
        },
        deck: [toDraw],
        discardPile: [],
        cells: Array.from(Array(5), () => Array.from(Array(5), () => [] as string[]))
    } as unknown as GameState;
    const events: EventsAPI = {
        endTurn: () => {
        }
    } as EventsAPI;

    const random: RandomAPI = {} as RandomAPI;
    return {G, events, random};
}

function isBait(card: Card) {
    return card.title === 'Bait';
}
