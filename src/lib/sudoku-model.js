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

export const newSudokuModel = (initialDigits = '') => {
    const grid = Map({
        undoList: List(),
        redoList: List(),
        cells: List(),
        focusIndex: null,
    });
    return modelHelpers.applyAction(grid, ['setInitialDigits', initialDigits]);
};

export const modelHelpers = {
    CENTER_CELL: 40,

    applyAction: (grid, action) => {
        const [actionName, ...args] = action;
        const f = modelHelpers[actionName];
        if (!f) {
            throw new Error(`No helper to apply action: '${actionName}'`)
        }
        grid = f(grid, ...args);
        return grid
            .update('undoList', list => list.push(action))
            .set('redoList', List());
    },

    setInitialDigits: (grid, initialDigits) => {
        const cells = Range(0, 81).map(i => newCell(i, initialDigits[i]));
        return grid.set('cells', cells);
    },

    setCellProperties: (grid, cellProps) => {
        let cells = grid.get('cells');
        cellProps.forEach(cellUpdate => {
            const [index, propUpdates] = cellUpdate;
            const c = cells.get(index).merge(propUpdates);
            cells = cells.map(cell => cell.get('index') === index ? c : cell);
        });
        return grid.set('cells', cells);
    },

    undoOneAction: (grid) => {
        let undoList = grid.get('undoList');
        let redoList = grid.get('redoList');
        if (undoList.size <= 1) {
            return grid;
        }
        grid = newSudokuModel();
        const last = undoList.last();
        undoList = undoList.pop();
        redoList = redoList.push(last);
        undoList.forEach(action => {
            grid = modelHelpers.applyAction(grid, action)
        });
        return grid
            .set('undoList', undoList)
            .set('redoList', redoList);
    },

    redoOneAction: (grid) => {
        let redoList = grid.get('redoList');
        if (redoList.size < 1) {
            return grid;
        }
        const last = redoList.last();
        redoList = redoList.pop();
        grid = modelHelpers.applyAction(grid, last);
        return grid
            .set('redoList', redoList);
    },

    updateSelectedCells: (grid, opName, ...args) => {
        const op = modelHelpers[opName + 'AsAction'];
        if (!op) {
            throw new Error(`Unknown cell update operation: '${opName}'`);
        }
        const action = op(grid, opName, ...args);
        return modelHelpers.applyAction(grid, action);
    },

    setDigitAsAction: (grid, opName, newDigit) => {
        const cellUpdates = grid.get('cells')
            .filter(c => !c.get('isGiven') && c.get('selected') && c.get('digit') !== newDigit)
            .map(c => {
                return [
                    c.get('index'),
                    Map({'digit': newDigit})
                ]
            }).toJS();
        return [ 'setCellProperties', cellUpdates ];
    },

    applyCellOp: (grid, opName, ...args) => {
        const op = modelHelpers[opName];
        if (!op) {
            throw new Error(`Unknown cell operation: '${opName}'`);
        }
        const newCells = grid.get('cells').map(c => op(c, ...args));
        if (opName === 'setSelection' || opName === 'extendSelection') {
            grid = grid.set('focusIndex', args[0]);
        }
        return grid.set('cells', newCells);
    },

    setSelection: (c, index) => {
        if (c.get('index') === index) {
            return c.set('selected', true);
        }
        else if (c.get('selected')) {
            return c.set('selected', false);
        }
        return c;
    },

    extendSelection: (c, index) => {
        if (c.get('index') === index && !c.get('selected')) {
            return c.set('selected', true);
        }
        return c;
    },

    clearSelection: (c) => {
        if (c.get('selected')) {
            return c.set('selected', false);
        }
        return c;
    },

    setDigit: (c, newDigit) => {
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

    moveFocus: (grid, deltaX, deltaY, isExtend) => {
        let focusIndex = grid.get('focusIndex');
        if (focusIndex === null) {
            focusIndex = modelHelpers.CENTER_CELL;
        }
        else  {
            const newCol = (9 + focusIndex % 9 + deltaX) % 9;
            const newRow = (9 + Math.floor(focusIndex / 9) + deltaY) % 9;
            focusIndex = newRow * 9 + newCol;
        }
        const operation = isExtend ? 'extendSelection' : 'setSelection';
        return modelHelpers.applyCellOp(grid, operation, focusIndex);
    },

}
