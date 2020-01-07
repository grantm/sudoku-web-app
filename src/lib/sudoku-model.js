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
        // Properties set at creation and then never changed
        index,
        row,
        column,
        box: Math.floor((row - 1) / 3) * 3 + Math.floor((column - 1) / 3) + 1,
        location: `R${row}C${column}`,
        isGiven: digit !== '0',
        x: 50 + (column - 1) * 100,
        y: 50 + (row - 1) * 100,
        // Properties that might change and get serialised for undo/redo
        digit,
        outerPencils: Set(),
        innerPencils: Set(),
        colorCode: '1',
        // Transient properties that might change but are not preserved by undo
        isSelected: false,
        isError: false,
    });
}

export const newSudokuModel = (initialDigits) => {
    const mode = initialDigits ? 'play' : 'enter';
    const grid = Map({
        initialDigits: '',
        solved: false,
        mode,
        inputMode: 'digit',
        tempInputMode: undefined,
        startTime: mode === 'play' ? Date.now() : undefined,
        endTime: undefined,
        undoList: List(),
        redoList: List(),
        cells: List(),
        focusIndex: null,
        completedDigits: {},
        matchDigit: 0,
        modalState: undefined,
    });
    return modelHelpers.setInitialDigits(grid, initialDigits || '');
};

function actionsBlocked(grid) {
    return grid.get('solved') || (grid.get('modalState') !== undefined);
}

export const modelHelpers = {
    CENTER_CELL: 40,

    setInitialDigits: (grid, initialDigits) => {
        const cells = Range(0, 81).map(i => newCell(i, initialDigits[i]));
        grid = grid
            .set('initialDigits', initialDigits)
            .set('cells', cells);
        return modelHelpers.highlightErrorCells(grid);
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
        return modelHelpers.retainSelection(grid, (grid) => {
            const undoList = grid.get('undoList');
            if (actionsBlocked(grid) || undoList.size < 1) {
                return grid;
            }
            const beforeUndo = modelHelpers.toSnapshotString(grid);
            const snapshot = undoList.last();
            grid = modelHelpers.restoreSnapshot(grid, snapshot)
                .set('undoList', undoList.pop())
                .update('redoList', list => list.push(beforeUndo));
            return modelHelpers.highlightErrorCells(grid);
        });
    },

    redoOneAction: (grid) => {
        return modelHelpers.retainSelection(grid, (grid) => {
            const redoList = grid.get('redoList');
            if (actionsBlocked(grid) || redoList.size < 1) {
                return grid;
            }
            const beforeRedo = modelHelpers.toSnapshotString(grid);
            const snapshot = redoList.last();
            grid = modelHelpers.restoreSnapshot(grid, snapshot)
                .set('redoList', redoList.pop())
                .update('undoList', list => list.push(beforeRedo));
            return modelHelpers.highlightErrorCells(grid);
        });
    },

    toSnapshotString: (grid) => {
        const cells = grid.get('cells');
        const snapshot = cells.filter(c => !c.get('isGiven')).map(c => {
            const index = c.get('index');
            const digit = c.get('digit');
            const iPad = index < 10 ? '0' : '';
            const colorCode = c.get('colorCode');
            let cs = '';
            if (digit !== '0') {
                cs = cs + 'D' + digit;
            }
            else {
                const inner = c.get('innerPencils').toArray().sort().join('');
                const outer = c.get('outerPencils').toArray().sort().join('');
                cs = cs +
                    (outer === '' ? '' : ('T' + outer)) +
                    (inner === '' ? '' : ('N' + inner));
            }
            if (colorCode !== '1') {
                cs = cs + 'C' + colorCode;
            }
            return cs === '' ? '' : `[${iPad}${index}${cs}]`;
        }).join('');
        return snapshot;
    },

    parseSnapshotString: (snapshot) => {
        const parsed = {};
        let i = 0;
        const length = snapshot.length;
        let props, index, state;
        while(i < length) {
            const char = snapshot[i];
            if (char === '[') {
                index = parseInt(snapshot.substr(i + 1, 2), 10);
                props = {
                    digit: '0',
                    innerPencils: [],
                    outerPencils: [],
                    colorCode: 1,
                };
                state = null;
                i = i + 2;
            }
            else if (char === ']') {
                parsed[index] = props;
            }
            else if (char === 'D') {
                props.digit = snapshot[i+1];
                i++;
            }
            else if (char === 'C') {
                props.colorCode = snapshot[i+1];
                i++;
            }
            else if (char === 'T' || char === 'N') {
                state = char;
            }
            else if ('0' <= char && char <= '9') {
                if (state === 'T') {
                    props.outerPencils.push(snapshot[i]);
                }
                else if (state === 'N') {
                    props.innerPencils.push(snapshot[i]);
                }
            }
            // else ignore any other character
            i++;
        }
        return parsed;
    },

    restoreSnapshot: (grid, snapshot) => {
        const parsed = modelHelpers.parseSnapshotString(snapshot);
        const empty = {
            digit: '0',
            outerPencils: [],
            innerPencils: [],
        };
        const newCells = grid.get('cells').map(c => {
            if (!c.get('isGiven')) {
                const index = c.get('index');
                const props = parsed[index] || empty;
                c = c
                    .set('digit', props.digit)
                    .set('colorCode', props.colorCode)
                    .set('outerPencils', Set(props.outerPencils))
                    .set('innerPencils', Set(props.innerPencils));
            }
            return c;
        });
        return grid.set('cells', newCells);
    },

    retainSelection: (grid, operation) => {
        const isSelected = grid.get('cells').filter(c => c.get('isSelected')).reduce((s, c) => {
            s[c.get('index')] = true;
            return s;
        }, {});

        grid = operation(grid);

        const newCells = grid.get('cells').map(c => {
            return (c.get('isSelected') === (isSelected[c.get('index')] || false))
                ? c
                : c.set('isSelected', true);
        });
        return grid.set('cells', newCells);
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
        if (grid.get('solved')) {
            grid = grid
                .set('solved', false)
                .set('startTime', Date.now())
                .set('endTime', undefined);
        }
        const emptySnapshot = '';
        return modelHelpers.restoreSnapshot(grid, emptySnapshot)
            .set('undoList', List())
            .set('redoList', List());
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
        const digitTally = {};
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
                if(!isError[index]) {
                    digitTally[digit] = (digitTally[digit] || 0) + 1;
                }
            }
        });
        const noErrors = Object.keys(isError).length === 0;
        const result = {};
        result.completedDigits = Object.keys(digitTally).reduce((c, d) => {
            c[d] = digitTally[d] === 9;
            return c;
        }, {});
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
        const op = modelHelpers[opName + 'AsCellOp'];
        if (!op) {
            console.log(`Unknown cell update operation: '${opName}'`);
            return grid;
        }
        const snapshotBefore = modelHelpers.toSnapshotString(grid);
        const newCells = grid.get('cells')
            .map(c => {
                if (c.get('isGiven') || !c.get('isSelected')) {
                    return c;
                }
                c = op(c, ...args);
                return c;
            });
        grid = grid.set('cells', newCells);
        const snapshotAfter = modelHelpers.toSnapshotString(grid);
        if (mode === 'play' && snapshotAfter === snapshotBefore) {
            return grid;
        }
        grid = modelHelpers.highlightErrorCells(grid);
        if (mode === 'enter' && opName === 'setDigit') {
            grid = modelHelpers.autoAdvanceFocus(grid);
        }
        else if (opName === 'setDigit') {
            const cells = grid.get('cells');
            if (cells.count(c => c.get('isSelected')) === 1) {
                const digit = cells.get(grid.get('focusIndex')).get('digit');
                grid = grid.set('matchDigit', digit);
            }
        }
        else if (opName === 'clearCell') {
            grid = grid.set('matchDigit', 0);
        }
        return grid
            .update('undoList', list => list.push(snapshotBefore))
            .set('redoList', List());
    },

    setDigitAsCellOp: (c, newDigit) => {
        if (c.get('digit') === newDigit) {
            return c;
        }
        return c.merge({
            'digit': newDigit,
            'outerPencils': Set(),
            'innerPencils': Set(),
            'isError': false,
        });
    },

    clearCellAsCellOp: (c) => {
        return c.merge({
            'digit': '0',
            'outerPencils': Set(),
            'innerPencils': Set(),
            'colorCode': 1,
            'isError': false,
        });
    },

    toggleInnerPencilMarkAsCellOp: (c, digit) => {
        let pencilMarks = c.get('innerPencils');
        pencilMarks = pencilMarks.includes(digit)
            ? pencilMarks.delete(digit)
            : pencilMarks.add(digit);
        return c.set('innerPencils', pencilMarks);
    },

    toggleOuterPencilMarkAsCellOp: (c, digit) => {
        let pencilMarks = c.get('outerPencils');
        pencilMarks = pencilMarks.includes(digit)
            ? pencilMarks.delete(digit)
            : pencilMarks.add(digit);
        return c.set('outerPencils', pencilMarks);
    },

    setCellColorAsCellOp: (c, newColorCode) => {
        return c.set('colorCode', newColorCode);
    },

    highlightErrorCells: (grid) => {
        const result = modelHelpers.checkGridForErrors(grid);
        grid = grid.set('completedDigits', result.completedDigits);
        if (result.allComplete && !grid.get('endTime')) {
            grid = modelHelpers.setGridSolved(grid);
        }
        grid = modelHelpers.applyErrorHighlights(grid, result.isError || {});
        return grid;
    },

    setGridSolved: (grid) => {
        return modelHelpers.applySelectionOp(grid, 'clearSelection')
            .set('solved', true)
            .set('endTime', Date.now());
    },

    applySelectionOp: (grid, opName, ...args) => {
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
            return c.set('isSelected', true);
        }
        else if (c.get('isSelected')) {
            return c.set('isSelected', false);
        }
        return c;
    },

    extendSelection: (c, index) => {
        if (c.get('index') === index && !c.get('isSelected')) {
            return c.set('isSelected', true);
        }
        return c;
    },

    clearSelection: (c) => {
        if (c.get('isSelected') || c.get('isError')) {
            return c.set('isSelected', false);
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
        return modelHelpers.applySelectionOp(grid, operation, focusIndex);
    },

    autoAdvanceFocus: (grid) => {
        const cells = grid.get('cells')
        const focusIndex = grid.get('focusIndex');
        const focusCell = cells.toList().get(focusIndex);
        if (focusCell && focusCell.get('isError')) {
            return grid;
        }
        if (cells.filter(c => c.get('isSelected')).count() !== 1) {
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
