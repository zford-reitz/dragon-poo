import {scurry} from './dragon-poo';
import {GameState} from './GameState';
import {Card} from './Card';
import {Player} from './Player';
import {EventsAPI} from 'boardgame.io/dist/types/src/plugins/events/events';
import {INVALID_MOVE} from 'boardgame.io/core';
import _ from 'lodash';
import {RandomAPI} from "boardgame.io/dist/types/src/plugins/random/random";
import {PlayerID} from "boardgame.io";

let game: { G: GameState, playerID: string, events: EventsAPI, random: RandomAPI };

beforeEach(() => {
    game = setupBoardWithMultipleScurryCardsInHand();
});

it('Scurrying moves a Scurry! card from Player\'s hand to the discard pile', () => {

    const beforeNumberOfScurryCardsInHand = _.filter(game.G.players['0'].hand, isScurry).length;
    const beforeNumberOfScurryCardsInDiscardPile = _.filter(game.G.discardPile, isScurry).length;

    scurry(game, irrelevantLocation());

    const afterNumberOfScurryCardsInHand = _.filter(game.G.players['0'].hand, isScurry).length;
    const afterNumberOfScurryCardsInDiscardPile = _.filter(game.G.discardPile, isScurry).length;

    expect(afterNumberOfScurryCardsInHand)
        .toEqual(beforeNumberOfScurryCardsInHand - 1);

    expect(afterNumberOfScurryCardsInDiscardPile)
        .toEqual(beforeNumberOfScurryCardsInDiscardPile + 1);
});

function irrelevantLocation() {
    return {row: 1, column: 1};
}

it('Scurrying draws a replacement card', () => {
    const toDraw = game.G.deck[0];

    scurry(game, irrelevantLocation());

    expect(game.G.players['0'].hand).toContain(toDraw);
    expect(game.G.deck.length).toBe(0);
});

it('trying to Scurry without a Scurry! Card in hand is an INVALID_MOVE', () => {
    const handFiller: Card = {title: '--InHandButNotPlayed--'} as Card;
    game.G.players['0'].hand = [handFiller];

    const playCardResult = scurry(game, irrelevantLocation());

    expect(playCardResult).toBe(INVALID_MOVE);
});

it('Scurrying moves Player to target location', () => {

    scurry(game, {row: 4, column: 2});

    expect(game.G.cells[4][2]).toContain('0');
});

function setupBoardWithMultipleScurryCardsInHand() {
    const toDraw: Card = {title: '--LastCardInDeck--'} as Card;

    const G = {
        players: {
            '0': {
                hand: [{title: 'Scurry!'} as Card, {title: 'Scurry!'} as Card]
            } as Player
        },
        deck: [toDraw],
        discardPile: [],
        cells: Array.from(Array(5), () => Array.from(Array(5), () => [] as string[]))
    } as unknown as GameState;
    const playerID: PlayerID = '0';
    const events: EventsAPI = {
        endTurn: () => {
        }
    } as EventsAPI;

    const random: RandomAPI = {
        D6(): number {
            return 1;
        }
    } as RandomAPI;
    return {G, playerID, events, random};
}

function isScurry(card: Card) {
    return card.title === 'Scurry!';
}
