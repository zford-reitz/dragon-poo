import {placeBait} from './dragon-poo';
import {GameState} from './GameState';
import {Card} from './Card';
import {Player} from './Player';
import {EventsAPI} from 'boardgame.io/dist/types/src/plugins/events/events';
import {INVALID_MOVE} from 'boardgame.io/core';
import _ from 'lodash';
import {RandomAPI} from "boardgame.io/dist/types/src/plugins/random/random";
import {PlayerID} from "boardgame.io";

let game: { G: GameState, playerID: PlayerID, events: EventsAPI, random: RandomAPI };

beforeEach(() => {
    game = setupBoardWithMultipleBaitCardsInHand();
});

it('placing Bait moves a Bait card from Player\'s hand to the discard pile', () => {

    const beforeNumberOfBaitCardsInHand = _.filter(game.G.players['0'].hand, isBait).length;
    const beforeNumberOfBaitCardsInDiscardPile = _.filter(game.G.discardPile, isBait).length;

    placeBait(game, irrelevantLocation());

    const afterNumberOfBaitCardsInHand = _.filter(game.G.players['0'].hand, isBait).length;
    const afterNumberOfBaitCardsInDiscardPile = _.filter(game.G.discardPile, isBait).length;

    expect(afterNumberOfBaitCardsInHand)
        .toEqual(beforeNumberOfBaitCardsInHand - 1);

    expect(afterNumberOfBaitCardsInDiscardPile)
        .toEqual(beforeNumberOfBaitCardsInDiscardPile + 1);
});

function irrelevantLocation() {
    return {row: 1, column: 1};
}

it('placing Bait draws a replacement card', () => {
    const toDraw = game.G.secret.deck[0];

    placeBait(game, irrelevantLocation());

    expect(game.G.players['0'].hand).toContain(toDraw);
    expect(game.G.secret.deck.length).toBe(0);
});

it('trying to place Bait without a Bait Card in hand is an INVALID_MOVE', () => {
    const handFiller: Card = {title: '--InHandButNotPlayed--'} as Card;
    game.G.players['0'].hand = [handFiller];

    const playCardResult = placeBait(game, irrelevantLocation());

    expect(playCardResult).toBe(INVALID_MOVE);
});

it('placing Bait places a Bait token on the selected tile', () => {

    placeBait(game, {row: 4, column: 2});

    expect(game.G.cells[4][2]).toContain('Bait');
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
    const playerID = '0';
    const events: EventsAPI = {
        endTurn: () => {
        }
    } as EventsAPI;

    const random: RandomAPI = {} as RandomAPI;
    return {G, playerID, events, random};
}

function isBait(card: Card) {
    return card.title === 'Bait';
}
