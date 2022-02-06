import {possibleMoves} from './dragon-bait-pathing';

describe('DragonBaitPathing', () => {

    it('find one direction when one square away with no walls', () => {
        const moves = possibleMoves({row: 0, column: 0}, [{row: 0, column: 1}], []);
        expect(moves).toEqual([{row: 0, column: 1}]);
    });

    it('find two directions when one diagonal square away with no walls', () => {
        const start = {row: 0, column: 0};
        const goal = {row: 1, column: 1};
        const moves = possibleMoves(start, [goal], []);
        expect(moves).toEqual([
            {row: 0, column: 1},
            {row: 1, column: 0},
        ]);
    });

    it('find two directions when two goals are equally far away with no walls', () => {
        const start = {row: 0, column: 0};
        const goals = [{row: 0, column: 1}, {row: 1, column: 0}];
        const moves = possibleMoves(start, goals, []);
        expect(moves).toEqual([
            {row: 0, column: 1},
            {row: 1, column: 0},
        ]);
    });

    it('sidestep walls when going through them would be more expensive', () => {
        const start = {row: 0, column: 0};
        const goals = [{row: 0, column: 4}];
        const moves = possibleMoves(start, goals, [
            {from: {row: 0, column: 0}, to: {row: 0, column: 1}},
            {from: {row: 0, column: 1}, to: {row: 0, column: 2}},
            {from: {row: 0, column: 2}, to: {row: 0, column: 3}},
            {from: {row: 0, column: 3}, to: {row: 0, column: 4}},
        ]);
        expect(moves).toEqual([
            {row: 1, column: 0},
        ]);
    });

});