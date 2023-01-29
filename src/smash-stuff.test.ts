import {getPiecesAt, POO, smashStuff} from './dragon-poo';
import {GameState} from './GameState';
import {Card} from './Card';
import {Player} from './Player';
import {EventsAPI} from 'boardgame.io/dist/types/src/plugins/events/events';
import {INVALID_MOVE} from 'boardgame.io/core';
import _ from 'lodash';
import {RandomAPI} from 'boardgame.io/dist/types/src/plugins/random/random';
import {PlayerID} from 'boardgame.io';
import {Location} from './location';

let game: { G: GameState, playerID: string, events: EventsAPI, random: RandomAPI };

beforeEach(() => {
    game = setupBoardWithMultipleSmashStuffCardsInHand();
});

it('Smashing stuff moves a Smash Stuff! card from Player\'s hand to the discard pile', () => {

    const beforeNumberOfSmashStuffCardsInHand = _.filter(game.G.players['0'].hand, isSmashStuff).length;
    const beforeNumberOfSmashStuffCardsInDiscardPile = _.filter(game.G.discardPile, isSmashStuff).length;

    smashStuff(game, pooLocation());

    const afterNumberOfSmashStuffCardsInHand = _.filter(game.G.players['0'].hand, isSmashStuff).length;
    const afterNumberOfSmashStuffCardsInDiscardPile = _.filter(game.G.discardPile, isSmashStuff).length;

    expect(afterNumberOfSmashStuffCardsInHand)
        .toEqual(beforeNumberOfSmashStuffCardsInHand - 1);

    expect(afterNumberOfSmashStuffCardsInDiscardPile)
        .toEqual(beforeNumberOfSmashStuffCardsInDiscardPile + 1);
});

function pooLocation() {
    return {row: 1, column: 1};
}

it('Smashing stuff draws a replacement card', () => {
    const toDraw = game.G.deck[0];

    smashStuff(game, pooLocation());

    expect(game.G.players['0'].hand).toContain(toDraw);
    expect(game.G.deck.length).toBe(0);
});

it('trying to Smashing stuff without a Smashing Stuff! Card in hand is an INVALID_MOVE', () => {
    const handFiller: Card = {title: '--InHandButNotPlayed--'} as Card;
    game.G.players['0'].hand = [handFiller];

    const playCardResult = smashStuff(game, pooLocation());

    expect(playCardResult).toBe(INVALID_MOVE);
});

it('Smash stuff removes single Poo at selected location', () => {
    getPieces(pooLocation()).push(POO);
    getPieces(pooLocation()).push(POO);
    expect(_.countBy(getPieces(pooLocation()), (piece) => piece === POO).true).toBe(3);

    smashStuff(game, pooLocation());

    expect(_.countBy(getPieces(pooLocation()), (piece) => piece === POO).true).toBe(2);
});

it('Smash stuff at location without Poo is an INVALID_MOVE', () => {
    let nonPooLocation = {row: 4, column: 4};
    expect(getPieces(nonPooLocation).includes(POO)).toBe(false);

    expect(smashStuff(game, nonPooLocation)).toBe(INVALID_MOVE);
});

function getPieces(location: Location) {
    return getPiecesAt(game.G, location);
}

function setupBoardWithMultipleSmashStuffCardsInHand() {
    const toDraw: Card = {title: '--LastCardInDeck--'} as Card;

    const G: GameState = {
        players: {
            '0': {
                hand: [{title: 'Smash Stuff!'} as Card, {title: 'Smash Stuff!'} as Card]
            } as Player
        },
        pooCount: {
            '0': 0
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

    getPiecesAt(G, pooLocation()).push(POO);

    return {G, playerID, events, random};
}

function isSmashStuff(card: Card) {
    return card.title === 'Smash Stuff!';
}
