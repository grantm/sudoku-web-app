import { List, Map, Range } from 'immutable';

function newCell(index, digit) {
    digit = digit || '0';
    if (!digit.match(/^[0-9]$/)) {
        throw new RangeError(
            `Invalid Cell() value '${digit}', expected '0'..'9'`
        );
    }
    const row = Math.floor(index / 9) + 1;
    const column = (index % 9) + 1;
    return Map({
        index,
        digit,
        row,
        column,
        box: Math.floor((row - 1) / 3) * 3 + Math.floor((column - 1) / 3) + 1,
        location: `R${row}C${column}`,
        isGiven: digit !== '0',
        x: 50 + (column - 1) * 100,
        y: 50 + (row - 1) * 100,
        selected: false,
    });
}

class SudokuModel {
    constructor (cells) {
        this.cells = cells;
    }

    static newFromString81 (str) {
        const cells = List(Range(0, 81)).map(i => newCell(i, str[i]));
        // const cells = [...Array(81).keys()].map(i => newCell(i, str[i]));
        return new SudokuModel(cells);
    }

    applyCellOp (opName, index) {
        const op = this[opName];
        if (!op) {
            throw new Error(`Unknown cell operation: '${opName}'`);
        }
        const newCells = this.cells.map(c => op(c, index));
        return new SudokuModel(newCells);
    }

    setSelection (c, index) {
        if (c.get('index') === index) {
            return c.set('selected', true);
        }
        else if (c.get('selected')) {
            return c.set('selected', false);
        }
        return c;
    }

    extendSelection (c, index) {
        if (c.get('index') === index && !c.get('selected')) {
            return c.set('selected', true);
        }
        return c;
    }

}

export default SudokuModel;
