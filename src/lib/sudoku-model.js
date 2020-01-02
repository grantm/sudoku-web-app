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

export const newSudokuModel = (initialDigits) => {
    const mode = initialDigits ? 'play' : 'enter';
    const grid = Map({
        initialDigits: '',
        mode,
        inputMode: 'digit',
        tempInputMode: undefined,
        startTime: mode === 'play' ? Date.now() : undefined,
        endTime: undefined,
        undoList: List(),
        redoList: List(),
        inUndo: false,
        cells: List(),
        focusIndex: null,
        matchDigit: 0,
        modalState: undefined,
    });
    return modelHelpers.applyAction(grid, ['setInitialDigits', initialDigits || '']);
};

function actionsBlocked(grid) {
    return grid.get('solved') || (grid.get('modalState') !== undefined);
}

export const modelHelpers = {
    CENTER_CELL: 40,

    applyAction: (grid, action) => {
        if (actionsBlocked(grid)) {
            return grid;
        }
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
        return grid
            .set('initialDigits', initialDigits)
            .set('cells', cells);
    },

    setCellProperties: (grid, cellProps) => {
        if (actionsBlocked(grid)) {
            return grid;
        }
        let cells = grid.get('cells');
        cellProps.forEach(cellUpdate => {
            const [index, propUpdates] = cellUpdate;
            const c = cells.get(index).merge(propUpdates);
            cells = cells.map(cell => cell.get('index') === index ? c : cell);
        });
        return grid.set('cells', cells);
    },

    undoOneAction: (grid) => {
        if (actionsBlocked(grid)) {
            return grid;
        }
        let undoList = grid.get('undoList');
        let redoList = grid.get('redoList');
        if (undoList.size <= 1) {
            return grid;
        }
        grid = grid.set('cells', List()).set('inUndo', true);
        const last = undoList.last();
        undoList = undoList.pop();
        redoList = redoList.push(last);
        undoList.forEach(action => {
            grid = modelHelpers.applyAction(grid, action)
        });
        grid = grid.set('inUndo', false);
        grid = modelHelpers.highlightErrorCells(grid);
        return grid
            .set('undoList', undoList)
            .set('redoList', redoList);
    },

    redoOneAction: (grid) => {
        if (actionsBlocked(grid)) {
            return grid;
        }
        let redoList = grid.get('redoList');
        if (redoList.size < 1) {
            return grid;
        }
        const last = redoList.last();
        redoList = redoList.pop();
        grid = modelHelpers.applyAction(grid, last);
        grid = modelHelpers.highlightErrorCells(grid);
        return grid.set('redoList', redoList);
    },

    confirmRestart: (grid) => {
        return grid.set('modalState', { modalType: 'confirm-restart'});
    },

    applyModalAction: (grid, action) => {
        grid = grid.set('modalState', undefined);
        if (action === 'cancel') {
            return grid;
        }
        else if (action === 'restart-confirmed') {
            return modelHelpers.applyRestart(grid);
        }
        return grid;
    },

    applyRestart: (grid) => {
        let undoList = grid.get('undoList');
        if (undoList.size <= 1) {
            return grid;
        }
        undoList = List([undoList.get(0), 'Dummy action'])
        grid = grid.set('undoList', undoList).set('redoList', List());
        return modelHelpers.undoOneAction(grid);
    },

    gameOverCheck: (grid) => {
        const result = modelHelpers.checkGridForErrors(grid);
        if (result.isError) {
            grid = modelHelpers.applyErrorHighlights(grid, result.isError);
        }
        if (result.errorMessage) {
            grid = grid.set('modalState', { modalType: 'check-result', result });
        }
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
        if (actionsBlocked(grid)) {
            return grid;
        }
        const mode = grid.get('mode');
        if (mode === 'enter' && opName === 'togglePencilMark') {
            opName = 'setDigit';
        }
        const op = modelHelpers[opName + 'AsAction'];
        if (!op) {
            console.log(`Unknown cell update operation: '${opName}'`);
            return grid;
        }
        const action = op(grid, opName, ...args);
        grid = modelHelpers.applyAction(grid, action);
        if (!grid.get('inUndo')) {
            grid = modelHelpers.highlightErrorCells(grid);
            if (mode === 'enter' && opName === 'setDigit') {
                grid = modelHelpers.autoAdvanceFocus(grid);
            }
            else if (opName === 'setDigit') {
                const cells = grid.get('cells');
                if (cells.count(c => c.get('selected')) === 1) {
                    const digit = cells.get(grid.get('focusIndex')).get('digit');
                    grid = grid.set('matchDigit', digit);
                }
            }
            else if (opName === 'clearCell') {
                grid = grid.set('matchDigit', 0);
            }
        }
        return grid;
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

    togglePencilMarkAsAction: (grid, opName, digit, target) => {
        const setKey = target === 'outer' ? 'outerPencils' : 'innerPencils';
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

    highlightErrorCells: (grid) => {
        const result = modelHelpers.checkGridForErrors(grid);
        if (result.allComplete && !grid.get('endTime')) {
            grid = modelHelpers.setGridSolved(grid);
        }
        grid = modelHelpers.applyErrorHighlights(grid, result.isError || {});
        return grid;
    },

    setGridSolved: (grid) => {
        return modelHelpers.applyCellOp(grid, 'clearSelection')
            .set('solved', true)
            .set('endTime', Date.now());
    },

    applyCellOp: (grid, opName, ...args) => {
        if (actionsBlocked(grid)) {
            return grid;
        }
        const op = modelHelpers[opName];
        if (!op) {
            console.log(`Unknown cell operation: '${opName}'`);
            return grid;
        }
        const newCells = grid.get('cells').map(c => op(c, ...args));
        if (opName === 'setSelection' || opName === 'extendSelection') {
            const currIndex = args[0];
            grid = grid.set('focusIndex', currIndex);
            if (opName === 'setSelection') {
                const currDigit = newCells.get(currIndex).get('digit');
                grid = grid.set('matchDigit', currDigit);
            }
            else {
                grid = grid.set('matchDigit', '0');
            }
        }
        else if (opName === 'clearSelection') {
            grid = grid.set('matchDigit', '0');
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
            return c.set('selected', false);
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

    autoAdvanceFocus: (grid) => {
        const cells = grid.get('cells')
        const focusIndex = grid.get('focusIndex');
        const focusCell = cells.toList().get(focusIndex);
        if (focusCell && focusCell.get('isError')) {
            return grid;
        }
        if (cells.filter(c => c.get('selected')).count() !== 1) {
            return grid;
        }
        grid = modelHelpers.moveFocus(grid, 1, 0, false);
        if (grid.get('focusIndex') % 9 === 0) {
            grid = modelHelpers.moveFocus(grid, 0, 1, false);
        }
        return grid;
    },

    setInputMode: (grid, newMode) => {
        if (actionsBlocked(grid)) {
            return grid;
        }
        if (newMode.match(/^(digit|inner|outer|color)$/)) {
            grid = grid.set('inputMode', newMode);
        }
        return grid;
    },

    setTempInputMode: (grid, newMode) => {
        if (actionsBlocked(grid)) {
            return grid;
        }
        if (newMode.match(/^(inner|outer)$/)) {
            grid = grid.set('tempInputMode', newMode);
        }
        return grid;
    },

    clearTempInputMode: (grid) => {
        return grid.set('tempInputMode', undefined);
    },

    asDigits: (grid) => {
        return grid.get('cells').map(c => c.get('digit')).join('');
    },

}
