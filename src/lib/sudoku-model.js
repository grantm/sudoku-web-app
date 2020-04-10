// import { List, Map, Range, Set } from 'immutable';
import { List, Map, Range, Set } from './not-mutable';

const cellSets = initCellSets();

function initCellSets() {
    const row = {}, col = {}, box = {};
    Range(1, 10).forEach((i) => {
        row[i] = [];
        col[i] = [];
        box[i] = [];
    });
    Range(0, 81).forEach((i) => {
        const r = Math.floor(i / 9) + 1;
        const c = (i % 9) + 1;
        const b = Math.floor((r - 1) / 3) * 3 + Math.floor((c - 1) / 3) + 1;
        row[r].push(i);
        col[c].push(i);
        box[b].push(i);
    });
    return {row, col, box};
}


function newCell(index, digit) {
    digit = digit || '0';
    if (!digit.match(/^[0-9]$/)) {
        throw new RangeError(
            `Invalid Cell() value '${digit}', expected '0'..'9'`
        );
    }
    const row = Math.floor(index / 9) + 1;
    const col = (index % 9) + 1;
    return Map({
        // Properties set at creation and then never changed
        index,
        row,
        col,
        box: Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3) + 1,
        location: `R${row}C${col}`,
        isGiven: digit !== '0',
        x: 50 + (col - 1) * 100,
        y: 50 + (row - 1) * 100,
        // Properties that might change and get serialised for undo/redo
        digit,
        outerPencils: Set(),
        innerPencils: Set(),
        colorCode: '1',
        // Cache for serialised version of above properties
        snapshot: '',
        // Transient properties that might change but are not preserved by undo
        isSelected: false,
        isError: false,
    });
}

export const newSudokuModel = ({initialDigits, storeCurrentSnapshot}) => {
    const mode = initialDigits ? 'play' : 'enter';
    const grid = Map({
        initialDigits: '',
        solved: false,
        mode,
        inputMode: 'digit',
        tempInputMode: undefined,
        startTime: mode === 'play' ? Date.now() : undefined,
        endTime: undefined,
        pausedAt: undefined,
        undoList: List(),
        redoList: List(),
        currentSnapshot: '',
        storeCurrentSnapshot: storeCurrentSnapshot,
        cells: List(),
        focusIndex: null,
        completedDigits: {},
        matchDigit: '0',
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
        const cells = Range(0, 81).toList().map(i => newCell(i, initialDigits[i]));
        return modelHelpers.highlightErrorCells(grid.merge({
            'initialDigits': initialDigits,
            'cells': cells,
        }));
    },

    setCurrentSnapshot: (grid, newSnapshot) => {
        if (grid.get('currentSnapshot') !== newSnapshot) {
            grid = grid.set('currentSnapshot', newSnapshot);
            const watcher = grid.get('storeCurrentSnapshot');
            if (watcher) {
                watcher(newSnapshot);
            }
        }
        return grid;
    },

    undoOneAction: (grid) => {
        return modelHelpers.retainSelection(grid, (grid) => {
            const undoList = grid.get('undoList');
            if (actionsBlocked(grid) || undoList.size < 1) {
                return grid;
            }
            const beforeUndo = grid.get('currentSnapshot');
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
            const beforeRedo = grid.get('currentSnapshot');
            const snapshot = redoList.last();
            grid = modelHelpers.restoreSnapshot(grid, snapshot)
                .set('redoList', redoList.pop())
                .update('undoList', list => list.push(beforeRedo));
            return modelHelpers.highlightErrorCells(grid);
        });
    },

    updateSnapshotCache: (c) => {
        const digit = c.get('digit');
        const colorCode = c.get('colorCode');
        let cs = '';
        if (digit !== '0' && !c.get('isGiven')) {
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
        return c.set('snapshot', cs);
    },

    toSnapshotString: (grid) => {
        const cells = grid.get('cells');
        const snapshot = cells.filter(c => {
            return c.get('snapshot') !== '';
        }).map(c => {
            const index = c.get('index');
            return (index < 10 ? '0' : '') + index + c.get('snapshot');
        }).toArray().join(',');
        return snapshot;
    },

    parseSnapshotString: (snapshot) => {
        const parsed = {};
        snapshot.split(',').forEach(csn => {
            const props = {
                digit: '0',
                innerPencils: [],
                outerPencils: [],
                colorCode: '1',
                snapshot: '',
            };
            const index = parseInt(csn.substr(0, 2), 10);
            props.snapshot = csn.substr(2);
            let state = null;
            for(let i = 2; i < csn.length; i++) {
                const char = csn[i];
                if (char === 'D') {
                    props.digit = csn[i+1];
                    i++;
                }
                else if (char === 'C') {
                    props.colorCode = csn[i+1];
                    i++;
                }
                else if (char === 'T' || char === 'N') {
                    state = char;
                }
                else if ('0' <= char && char <= '9') {
                    if (state === 'T') {
                        props.outerPencils.push(csn[i]);
                    }
                    else if (state === 'N') {
                        props.innerPencils.push(csn[i]);
                    }
                }
                // else ignore any other character
            }
            parsed[index] = props;
        });
        return parsed;
    },

    restoreSnapshot: (grid, snapshot) => {
        const parsed = modelHelpers.parseSnapshotString(snapshot);
        const empty = {
            digit: '0',
            colorCode: '1',
            outerPencils: [],
            innerPencils: [],
            snapshot: '',
        };
        const newCells = grid.get('cells').map(c => {
            const index = c.get('index');
            const props = parsed[index] || empty;
            if (c.get('isGiven')) {
                if (c.get('colorCode') !== props.colorCode) {
                    c = c.merge({
                        colorCode: props.colorCode,
                        snapshot: props.snapshot,
                    });
                }
            }
            else {
                c = c.merge({
                    digit: props.digit,
                    colorCode: props.colorCode,
                    outerPencils: Set(props.outerPencils),
                    innerPencils: Set(props.innerPencils),
                    snapshot: props.snapshot,
                });
            }
            return c;
        });
        grid = grid.set('cells', newCells);
        return modelHelpers.setCurrentSnapshot(grid, snapshot);
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

    confirmClearColorHighlights: (grid) => {
        const coloredCount = grid.get('cells').count(c => c.get('colorCode') !== '1')
        if (coloredCount > 0) {
            return grid.set('modalState', { modalType: 'confirm-clear-color-highlights'});
        }
        return grid;
    },

    applyModalAction: (grid, action) => {
        grid = grid.set('modalState', undefined);
        if (action === 'cancel') {
            return grid;
        }
        else if (action === 'restart-confirmed') {
            return modelHelpers.applyRestart(grid);
        }
        else if (action === 'clear-color-highlights-confirmed') {
            return modelHelpers.applyClearColorHighlights(grid);
        }
        else if (action === 'resume-timer') {
            return modelHelpers.resumeTimer(grid);
        }
        return grid;
    },

    applyRestart: (grid) => {
        if (grid.get('solved')) {
            grid = grid.merge({
                'solved': false,
                'startTime': Date.now(),
                'endTime': undefined,
            })
        }
        const emptySnapshot = '';
        return modelHelpers.restoreSnapshot(grid, emptySnapshot)
            .merge({
                'undoList': List(),
                'redoList': List(),
                'focusIndex': null,
                'matchDigit': '0',
                'completedDigits': {},
                'inputMode': 'digit',
            });
    },

    applyClearColorHighlights: (grid) => {
        const cells = grid.get('cells').map(c => {
            return c.get('colorCode') === '1'
                ? c
                : c.set('colorCode', 1);
        });
        return grid.set('cells', cells);
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
        const type = ['row', 'col', 'box'];
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
        const snapshotBefore = grid.get('currentSnapshot');
        let newCells = grid.get('cells')
            .map(c => {
                const canUpdate = (!c.get('isGiven') || opName === 'setCellColor' || opName === 'clearCell');
                if (canUpdate && c.get('isSelected')) {
                    return modelHelpers.updateSnapshotCache( op(c, ...args) );
                }
                else {
                    return c;
                }
            });
        if (opName === 'setDigit') {
            newCells = modelHelpers.autoCleanPencilMarks(newCells, args[0]);
        }
        grid = grid.set('cells', newCells);
        const snapshotAfter = modelHelpers.toSnapshotString(grid);
        if (mode === 'play' && snapshotAfter === snapshotBefore) {
            return grid;
        }
        grid = modelHelpers.highlightErrorCells(grid);
        if (mode === 'enter' && opName === 'setDigit') {
            grid = modelHelpers.autoAdvanceFocus(grid);
        }
        else if (
            opName === 'setDigit'
            || opName === 'toggleInnerPencilMark'
            || opName === 'toggleOuterPencilMark'
        ) {
            const newDigit = args[0];
            grid = grid.set('matchDigit', newDigit);
        }
        else if (opName === 'clearCell') {
            grid = grid.set('matchDigit', '0');
        }
        grid = grid
            .update('undoList', list => list.push(snapshotBefore))
            .set('redoList', List());
        return modelHelpers.setCurrentSnapshot(grid, snapshotAfter);
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
        return c.get('isGiven')
        ? c.set('colorCode', '1')
        : c.merge({
            digit: '0',
            outerPencils: Set(),
            innerPencils: Set(),
            colorCode: '1',
            isError: false,
        });
    },

    toggleInnerPencilMarkAsCellOp: (c, digit) => {
        if (c.get('digit') !== '0') {
            return c;
        }
        let pencilMarks = c.get('innerPencils');
        pencilMarks = pencilMarks.includes(digit)
            ? pencilMarks.delete(digit)
            : pencilMarks.add(digit);
        return c.set('innerPencils', pencilMarks);
    },

    toggleOuterPencilMarkAsCellOp: (c, digit) => {
        if (c.get('digit') !== '0') {
            return c;
        }
        let pencilMarks = c.get('outerPencils');
        pencilMarks = pencilMarks.includes(digit)
            ? pencilMarks.delete(digit)
            : pencilMarks.add(digit);
        return c.set('outerPencils', pencilMarks);
    },

    setCellColorAsCellOp: (c, newColorCode) => {
        return c.set('colorCode', newColorCode);
    },

    autoCleanPencilMarks: (cells, newDigit) => {
        let isEliminated = {};
        cells.forEach(c => {
            if (c.get('isSelected') && !c.get('isGiven')) {
                [
                    cellSets.row[c.get('row')],
                    cellSets.col[c.get('col')],
                    cellSets.box[c.get('box')],
                ].flat().forEach(i => isEliminated[i] = true);
            }
        });
        return cells.map(c => {
            const i = c.get('index');
            if (c.get('digit') === '0' && isEliminated[i]) {
                const inner = c.get('innerPencils');
                const outer = c.get('outerPencils');
                if (inner.includes(newDigit) || outer.includes(newDigit)) {
                    return modelHelpers.updateSnapshotCache(
                        c.merge({
                            innerPencils: inner.delete(newDigit),
                            outerPencils: outer.delete(newDigit),
                        })
                    );
                }
            }
            return c;
        });
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

    pauseTimer: (grid) => {
        return grid.merge({
            pausedAt: Date.now(),
            modalState: { modalType: 'paused'},
        });
    },

    resumeTimer: (grid) => {
        const elapsed = grid.get('pausedAt') - grid.get('startTime');
        return grid.merge({
            pausedAt: undefined,
            startTime: Date.now() - elapsed,
        });
    },

    clearPencilmarks: (grid) => {
        const cells = grid.get('cells');
        const clearSnapshot = cells.filter(c => !c.get('isGiven') && c.get('digit') !== '0')
            .map(c => {
                const index = c.get('index');
                return (index < 10 ? '0' : '') + index + 'D' + c.get('digit');
            })
            .join(',');
        const snapshotBefore = grid.get('currentSnapshot');
        grid = modelHelpers.restoreSnapshot(grid, clearSnapshot)
            .update('undoList', list => list.push(snapshotBefore))
            .set('redoList', List());
        return modelHelpers.setCurrentSnapshot(grid, clearSnapshot);
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

    toggleExtendSelection: (c, index) => {
        if (c.get('index') === index) {
            return c.set('isSelected', !c.get('isSelected'));
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
        const focusCell = cells.get(focusIndex);
        if (focusCell && focusCell.get('isError')) {
            return grid;
        }
        if (cells.filter(c => c.get('isSelected')).size !== 1) {
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
