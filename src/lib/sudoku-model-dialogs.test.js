import { newSudokuModel, modelHelpers } from './sudoku-model.js';

const initialDigits =
    '000008000' +
    '000007000' +
    '123456789' +
    '000005000' +
    '000004000' +
    '000003000' +
    '000002000' +
    '000001000' +
    '000009000';

function digitsFromGrid(grid) {
    return grid.get('cells').map(c => c.get('digit')).join('');
}

function errorCells(grid) {
    return grid.get('cells').filter(c => c.get('errorMessage') !== undefined).map(c => c.get('index')).join(',');
}

function truthyKeys(obj) {
    return Object.keys(obj).filter(k => !!obj[k]);
}

test('restart', () => {
    // Initialise grid, add some stuff & check state
    const wip = '14D1,27D1,42D1,44D3,45D2C2,54T68,55D1,64T8N79,65N79C6,68D1,73D1,99D1';
    let grid = newSudokuModel({initialDigits, skipCheck: true});
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 30);
    grid = modelHelpers.updateSelectedCells(grid, 'setDigit', '3');
    grid = modelHelpers.setInputMode(grid, 'outer');
    grid = modelHelpers.restoreSnapshot(grid, wip);
    grid = modelHelpers.checkCompletedDigits(grid);

    expect(grid.get('currentSnapshot')).toBe(wip);
    expect(grid.get('modalState')).toBe(undefined);
    expect(grid.get('focusIndex')).toBe(30);
    expect(grid.get('matchDigit')).toBe('3');
    expect(grid.get('inputMode')).toBe('outer');
    expect(errorCells(grid)).toBe('30');
    expect( truthyKeys(grid.get('completedDigits')) ).toStrictEqual(['1']);

    // Pop up the Restart dialog and cancel
    grid = modelHelpers.confirmRestart(grid);
    expect(grid.get('modalState')).toStrictEqual({
        modalType: "confirm-restart",
        solved: false,
        "escapeAction": "close"
    });
    grid = modelHelpers.applyModalAction(grid, 'cancel');

    expect(grid.get('modalState')).toBe(undefined);
    expect(grid.get('currentSnapshot')).toBe(wip);

    // Do it again, but confirm this time
    grid = modelHelpers.confirmRestart(grid);
    expect(grid.get('modalState')).toStrictEqual({
        modalType: "confirm-restart",
        solved: false,
        "escapeAction": "close"
    });
    grid = modelHelpers.applyModalAction(grid, 'restart-confirmed');
    grid = modelHelpers.checkCompletedDigits(grid);

    expect(grid.get('modalState')).toBe(undefined);
    expect(grid.get('currentSnapshot')).toBe('');
    expect(grid.get('focusIndex')).toBe(null);
    expect(grid.get('matchDigit')).toBe('0');
    expect(grid.get('inputMode')).toBe('digit');
    expect(digitsFromGrid(grid)).toBe(initialDigits);
    expect(errorCells(grid)).toBe('');
    expect( truthyKeys(grid.get('completedDigits')) ).toStrictEqual([]);
});

test('clear colours', () => {
    // Initialise grid, add some stuff & check state
    const wip = '14D1,28D1,42D1,44D3,45D2C2,54T68,55D1,64T8N79,65N79C6,68D1,73D1,99D1';
    let grid = newSudokuModel({initialDigits, skipCheck: true});
    grid = modelHelpers.restoreSnapshot(grid, wip);
    expect(grid.get('currentSnapshot')).toBe(wip);

    // Pop up the Clear colours dialog and cancel
    grid = modelHelpers.confirmClearColorHighlights(grid);
    expect(grid.get('modalState')).toStrictEqual({
        modalType: "confirm-clear-color-highlights",
        "escapeAction": "close"
    });
    grid = modelHelpers.applyModalAction(grid, 'cancel');

    expect(grid.get('modalState')).toBe(undefined);
    expect(grid.get('currentSnapshot')).toBe(wip);

    // Do it again, but confirm this time
    grid = modelHelpers.confirmClearColorHighlights(grid);
    expect(grid.get('modalState')).toStrictEqual({
        modalType: "confirm-clear-color-highlights",
        "escapeAction": "close"
    });
    grid = modelHelpers.applyModalAction(grid, 'restart-confirmed');

    expect(grid.get('modalState')).toBe(undefined);
    expect(grid.get('currentSnapshot')).toBe('');
});
