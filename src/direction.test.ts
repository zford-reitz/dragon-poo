import {direction} from "./dragon-poo";

describe('direction', () => {

    it('left', () => {
        expect(direction({row: 0, column: 1}, {row: 0, column: 0})).toBe('left');
    });

    it('right', () => {
        expect(direction({row: 0, column: 1}, {row: 0, column: 2})).toBe('right');
    });

    it('up', () => {
        expect(direction({row: 1, column: 0}, {row: 0, column: 0})).toBe('up');
    });

    it('down', () => {
        expect(direction({row: 1, column: 0}, {row: 2, column: 0})).toBe('down');
    });

});