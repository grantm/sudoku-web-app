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

export const newSudokuModel = (initialDigits) => {
    const grid = Map({
        undoList: List(),
        redoList: List(),
        cells: List(),
    });
    return modelHelpers.applyAction(grid, ['setInitialDigits', initialDigits]);
};

export const modelHelpers = {
    applyAction: (grid, action) => {
        const [actionName, ...args] = action;
        const f = modelHelpers[actionName];
        grid = grid
            .update('undoList', list => list.push(action))
            .set('redoList', List());
        return f(grid, ...args);
    },

    setInitialDigits: (grid, initialDigits) => {
        const cells = List(Range(0, 81)).map(i => newCell(i, initialDigits[i]));
        return grid.set('cells', cells);
    },

    applyCellOp: (grid, opName, ...args) => {
        const op = modelHelpers[opName];
        if (!op) {
            throw new Error(`Unknown cell operation: '${opName}'`);
        }
        const newCells = grid.get('cells').map(c => op(c, args));
        return grid.set('cells', newCells);
    },

    setSelection: (c, [index]) => {
        if (c.get('index') === index) {
            return c.set('selected', true);
        }
        else if (c.get('selected')) {
            return c.set('selected', false);
        }
        return c;
    },

    extendSelection: (c, [index]) => {
        if (c.get('index') === index && !c.get('selected')) {
            return c.set('selected', true);
        }
        return c;
    },

    setDigit: (c, [newDigit]) => {
        if (c.get('selected') && !c.get('isGiven') && c.get('digit') !== newDigit) {
            return c.set('digit', newDigit)
        }
        return c;
    },

    clearDigits: (c) => {
        if (c.get('selected') && !c.get('isGiven')) {
            return c.set('digit', '0')
        }
        return c;
    },

}
