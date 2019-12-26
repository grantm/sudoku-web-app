import { List, Map, Range, Set } from 'immutable';

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
        isError: false,
        x: 50 + (column - 1) * 100,
        y: 50 + (row - 1) * 100,
        selected: false,
        outerPencils: Set(),
        innerPencils: Set(),
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
            console.log(`No helper to apply action: '${actionName}'`);
            return grid;
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

    gameOverCheck: (grid) => {
        const result = modelHelpers.checkGridForErrors(grid);
        grid = modelHelpers.applyCellOp(grid, 'clearSelection');
        if (result.isError) {
            grid = modelHelpers.applyErrorHighlights(grid, result.isError);
        }
        console.log('Result:', result);
        return grid;
    },

    applyErrorHighlights: (grid, isError) => {
        const cells = grid.get('cells').map((c) => {
            const index = c.get('index');
            const ok = (
                c.get('isGiven')
                || c.get('isError') === (isError[index] || false)
            );
            return ok ? c : c.set('isError', isError[index] || false);
        });
        return grid.set('cells', cells);
    },

    checkGridForErrors: (grid) => {
        const cells = grid.get('cells');
        let incompleteCount = 0;
        const type = ['row', 'column', 'box'];
        const seen = [ {}, {}, {} ];
        const isError = {};
        cells.forEach((c, index) => {
            const digit = c.get('digit');
            if (digit === '0') {
                incompleteCount++;
            }
            else {
                for(let t = 0; t < 3; t++) {
                    const key = c.get(type[t]) + digit;
                    if (seen[t][key] !== undefined) {
                        isError[index] = true;
                        isError[ seen[t][key] ] = true;
                    }
                    seen[t][key] = index;
                };
            }
        });
        const noErrors = Object.keys(isError).length === 0;
        const result = {};
        const s = incompleteCount === 1 ? '' : 's';
        if (noErrors) {
            if (incompleteCount === 0) {
                result.allComplete = true;
            }
            else {
                result.errorMessage =
                    `No errors found but ${incompleteCount} cell${s} still empty`;
            }
        }
        else {
            result.isError = isError;
            result.errorMessage = `Errors found in highlighted cell${s}`;
        }
        return result;
    },

    updateSelectedCells: (grid, opName, ...args) => {
        const op = modelHelpers[opName + 'AsAction'];
        if (!op) {
            console.log(`Unknown cell update operation: '${opName}'`);
            return grid;
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
                    Map({
                        'digit': newDigit,
                        'outerPencils': Set(),
                        'innerPencils': Set(),
                        'isError': false,
                    })
                ]
            });
        return [ 'setCellProperties', cellUpdates ];
    },

    clearCellAsAction: (grid) => {
        const cellUpdates = grid.get('cells')
            .filter(c => !c.get('isGiven') && c.get('selected'))
            .map(c => {
                return [
                    c.get('index'),
                    Map({
                        'digit': '0',
                        'outerPencils': Set(),
                        'innerPencils': Set(),
                        'isError': false,
                    })
                ]
            });
        return [ 'setCellProperties', cellUpdates ];
    },

    togglePencilMarkAsAction: (grid, opName, mode, digit) => {
        const setKey = mode === 'outer' ? 'outerPencils' : 'innerPencils';
        const cellUpdates = grid.get('cells')
            .filter(c => c.get('digit') === '0' && c.get('selected'))
            .map(c => {
                let pencilMarks = c.get(setKey);
                pencilMarks = pencilMarks.includes(digit)
                    ? pencilMarks.delete(digit)
                    : pencilMarks.add(digit);
                return [ c.get('index'), Map({[setKey]: pencilMarks}) ];
            });
        return [ 'setCellProperties', cellUpdates ];
    },

    applyCellOp: (grid, opName, ...args) => {
        const op = modelHelpers[opName];
        if (!op) {
            console.log(`Unknown cell operation: '${opName}'`);
            return grid;
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
        if (c.get('selected') || c.get('isError')) {
            return c.set('selected', false).set('isError', false);
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
