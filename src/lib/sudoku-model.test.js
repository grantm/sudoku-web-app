import { newSudokuModel, modelHelpers, SETTINGS } from './sudoku-model.js';
// import { List } from 'immutable';
import { List } from './not-mutable';

const initialDigitsPartial =
    '000008000' +
    '000007000' +
    '123456789' +
    '000005000' +
    '000004000' +
    '000003000' +
    '000002000' +
    '000001000' +
    '000009000';

const initialDigitsComplete =
    '000001230' +
    '123008040' +
    '804007650' +
    '765000000' +
    '000000000' +
    '000000123' +
    '012300804' +
    '080400765' +
    '076500000';

const finalDigitsComplete =
    '657941238' +
    '123658947' +
    '894237651' +
    '765123489' +
    '231894576' +
    '948765123' +
    '512376894' +
    '389412765' +
    '476589312';

function mapPropNames (map) {
    // Not sure why map.keys() doesn't work
    return Object.keys( map.toObject() ).sort();
}

function digitsFromGrid(grid) {
    return grid.get('cells').map(c => c.get('digit')).join('');
}

function selectedCells(grid) {
    return grid.get('cells').filter(c => c.get('isSelected')).map(c => c.get('index')).join(',');
}

function pencilDigits (set) {
    return set.toArray().join('');
}

test('initialise grid (partial)', () => {
    let grid = newSudokuModel({initialDigits: initialDigitsPartial, skipCheck: true});

    const propNames = mapPropNames(grid);
    expect(propNames).toStrictEqual([
        "cells",
        "completedDigits",
        "currentSnapshot",
        "difficultyLevel",
        "endTime",
        "featureFlags",
        "focusIndex",
        "hasErrors",
        "initialDigits",
        "inputMode",
        "matchDigit",
        "modalState",
        "mode",
        "pausedAt",
        "redoList",
        "settings",
        "showPencilmarks",
        "solved",
        "startTime",
        "storeCurrentSnapshot",
        "tempInputMode",
        "undoList",
    ]);

    expect(digitsFromGrid(grid)).toBe(initialDigitsPartial);
    expect(grid.get('completedDigits')).toStrictEqual({
        "1": false,
        "2": false,
        "3": false,
        "4": false,
        "5": false,
        "6": false,
        "7": false,
        "8": false,
        "9": false,
    });
    expect(grid.get('currentSnapshot')).toBe('');
    expect(grid.get('endTime')).toBe(undefined);
    expect(grid.get('focusIndex')).toBe(null);
    expect(grid.get('initialDigits')).toBe(initialDigitsPartial);
    expect(grid.get('inputMode')).toBe('digit');
    expect(grid.get('matchDigit')).toBe('0');
    expect(grid.get('modalState')).toBe(undefined);
    expect(grid.get('finalDigits')).toBe(undefined);    // Not set due to skipCheck
    expect(grid.get('mode')).toBe('solve');
    expect(grid.get('pausedAt')).toBe(undefined);
    expect(grid.get('redoList').size).toBe(0);
    expect(grid.get('solved')).toBe(false);
    expect(grid.get('startTime')/1000).toBeCloseTo(Date.now()/1000, 0);
    expect(grid.get('storeCurrentSnapshot')).toBe(undefined);
    expect(grid.get('tempInputMode')).toBe(undefined);
    expect(grid.get('undoList').size).toBe(0);

    const settings = grid.get('settings')
    expect(typeof settings).toBe('object');
    const settingsKeys = Object.keys(settings).sort().join(',');
    const expectedKeys = Object.values(SETTINGS).sort().join(',');
    expect(settingsKeys).toBe(expectedKeys);
});

test('initialise grid (complete)', () => {
    let grid = newSudokuModel({initialDigits: initialDigitsComplete});   // no skipCheck
    expect(grid.get('modalState')).toBe(undefined);
    expect(grid.get('finalDigits')).toBe(finalDigitsComplete);
});

test('initialise grid cells', () => {
    let grid = newSudokuModel({initialDigits: initialDigitsPartial, skipCheck: true});

    // Expected pattern of given digits have been set up
    const cells = grid.get('cells');
    expect(List.isList(cells)).toBe(true);
    expect(cells.size).toBe(81);
    const givenDigits = cells.filter(c => c.get('isGiven'))
        .map(c => c.get('index') + ':' + c.get('digit'))
        .join(',');
    expect(givenDigits).toBe(
        '5:8,14:7,18:1,19:2,20:3,21:4,22:5,23:6,24:7,25:8,26:9,' +
        '32:5,41:4,50:3,59:2,68:1,77:9'
    );

    // No given digits are '0', all non-givens are '0'
    let cellsOK = true;
    cells.forEach(c => {
        if (c.get('isGiven')) {
            if (c.get('digit') === '0') {
                cellsOK = false;
            }
        }
        else {
            if (c.get('digit') !== '0') {
                cellsOK = false;
            }
        }
    });
    expect(cellsOK).toBe(true);

    // Examine first cell - a non-given
    const c0 = cells.get(0);
    const propNames = mapPropNames(c0);
    expect(propNames).toStrictEqual([
        "box",
        "col",
        "colorCode",
        "digit",
        "errorMessage",
        "index",
        "innerPencils",
        "isGiven",
        "isSelected",
        "outerPencils",
        "row",
        "snapshot",
    ]);
    expect(c0.get('box')).toBe(1);
    expect(c0.get('colorCode')).toBe('1');
    expect(c0.get('col')).toBe(1);
    expect(c0.get('digit')).toBe('0');
    expect(c0.get('index')).toBe(0);
    expect(c0.get('innerPencils').toArray()).toStrictEqual([]);
    expect(c0.get('errorMessage')).toBe(undefined);
    expect(c0.get('isGiven')).toBe(false);
    expect(c0.get('isSelected')).toBe(false);
    expect(c0.get('outerPencils').toArray()).toStrictEqual([]);
    expect(c0.get('row')).toBe(1);
    expect(c0.get('snapshot')).toBe('');

    expect(cells.get(3).get('box')).toBe(2);
    expect(cells.get(6).get('box')).toBe(3);
    expect(cells.get(9).get('box')).toBe(1);
    expect(cells.get(12).get('box')).toBe(2);
    expect(cells.get(15).get('box')).toBe(3);
    expect(cells.get(20).get('box')).toBe(1);
    expect(cells.get(23).get('box')).toBe(2);
    expect(cells.get(26).get('box')).toBe(3);
    expect(cells.get(37).get('box')).toBe(4);
    expect(cells.get(40).get('box')).toBe(5);
    expect(cells.get(43).get('box')).toBe(6);
    expect(cells.get(64).get('box')).toBe(7);
    expect(cells.get(67).get('box')).toBe(8);
    expect(cells.get(70).get('box')).toBe(9);

    expect(cells.get(4).get('row')).toBe(1);
    expect(cells.get(13).get('row')).toBe(2);
    expect(cells.get(22).get('row')).toBe(3);
    expect(cells.get(31).get('row')).toBe(4);
    expect(cells.get(40).get('row')).toBe(5);
    expect(cells.get(49).get('row')).toBe(6);
    expect(cells.get(58).get('row')).toBe(7);
    expect(cells.get(67).get('row')).toBe(8);
    expect(cells.get(76).get('row')).toBe(9);

    expect(cells.get(36).get('col')).toBe(1);
    expect(cells.get(37).get('col')).toBe(2);
    expect(cells.get(38).get('col')).toBe(3);
    expect(cells.get(39).get('col')).toBe(4);
    expect(cells.get(40).get('col')).toBe(5);
    expect(cells.get(41).get('col')).toBe(6);
    expect(cells.get(42).get('col')).toBe(7);
    expect(cells.get(43).get('col')).toBe(8);
    expect(cells.get(44).get('col')).toBe(9);
});

test('move input focus', () => {
    let grid = newSudokuModel({initialDigits: initialDigitsPartial, skipCheck: true});
    const move = false;     // No ctrl or shift
    const extend = true;    // Ctrl/shift + move

    expect(grid.get('currentSnapshot')).toBe('');
    grid = modelHelpers.moveFocus(grid, -1, 0, move);
    expect(grid.get('focusIndex')).toBe(40);
    expect(grid.get('focusIndex')).toBe(modelHelpers.CENTER_CELL);

    grid = modelHelpers.moveFocus(grid, -1, 0, move);
    expect(grid.get('focusIndex')).toBe(39);

    grid = modelHelpers.moveFocus(grid, -1, 0, move);
    expect(grid.get('focusIndex')).toBe(38);

    grid = modelHelpers.moveFocus(grid, -1, 0, move);
    expect(grid.get('focusIndex')).toBe(37);

    grid = modelHelpers.moveFocus(grid, -1, 0, move);
    expect(grid.get('focusIndex')).toBe(36);

    grid = modelHelpers.moveFocus(grid, -1, 0, move);
    expect(grid.get('focusIndex')).toBe(44);

    grid = modelHelpers.moveFocus(grid, 1, 0, move);
    expect(grid.get('focusIndex')).toBe(36);

    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 0);
    expect(grid.get('focusIndex')).toBe(0);
    grid = modelHelpers.moveFocus(grid, 0, -1, move);
    expect(grid.get('focusIndex')).toBe(72);

    grid = modelHelpers.moveFocus(grid, 0, 1, move);
    expect(grid.get('focusIndex')).toBe(0);

    // 'Home'
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', modelHelpers.CENTER_CELL);
    expect(grid.get('focusIndex')).toBe(40)

    // Extend the selection while moving focus
    expect(selectedCells(grid)).toBe('40');
    grid = modelHelpers.moveFocus(grid, 1, 0, extend);
    expect(selectedCells(grid)).toBe('40,41');
    grid = modelHelpers.moveFocus(grid, 1, 0, extend);
    expect(selectedCells(grid)).toBe('40,41,42');
    grid = modelHelpers.moveFocus(grid, -1, 0, extend);
    expect(selectedCells(grid)).toBe('40,41,42');
    grid = modelHelpers.moveFocus(grid, -1, 0, extend);
    expect(selectedCells(grid)).toBe('40,41,42');
    grid = modelHelpers.moveFocus(grid, -1, 0, extend);
    expect(selectedCells(grid)).toBe('39,40,41,42');
    grid = modelHelpers.moveFocus(grid, 0, 1, extend);
    expect(selectedCells(grid)).toBe('39,40,41,42,48');
    grid = modelHelpers.moveFocus(grid, 0, -1, extend);
    expect(selectedCells(grid)).toBe('39,40,41,42,48');
    grid = modelHelpers.moveFocus(grid, 0, -1, extend);
    expect(selectedCells(grid)).toBe('30,39,40,41,42,48');

    expect(grid.get('currentSnapshot')).toBe('');
});

test('extend selection', () => {
    let grid = newSudokuModel({initialDigits: initialDigitsPartial, skipCheck: true});
    expect(selectedCells(grid)).toBe('');
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 40);
    expect(selectedCells(grid)).toBe('40');
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 31);
    expect(selectedCells(grid)).toBe('31');
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 40);
    expect(selectedCells(grid)).toBe('31,40');
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 39);
    expect(selectedCells(grid)).toBe('31,39,40');
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 41);
    expect(selectedCells(grid)).toBe('31,39,40,41');
    grid = modelHelpers.applySelectionOp(grid, 'toggleExtendSelection', 40);
    expect(selectedCells(grid)).toBe('31,39,41');
    grid = modelHelpers.applySelectionOp(grid, 'toggleExtendSelection', 49);
    expect(selectedCells(grid)).toBe('31,39,41,49');
});

test('input mode', () => {
    let grid = newSudokuModel({initialDigits: initialDigitsPartial, skipCheck: true});

    const inputMode = (grid) => {
        return grid.get('tempInputMode') || grid.get('inputMode');
    }

    expect(grid.get('currentSnapshot')).toBe('');
    expect(inputMode(grid)).toBe('digit');

    grid = modelHelpers.setInputMode(grid, 'inner');
    expect(inputMode(grid)).toBe('inner');

    grid = modelHelpers.setTempInputMode(grid, 'outer');
    expect(inputMode(grid)).toBe('outer');

    grid = modelHelpers.setInputMode(grid, 'color');
    expect(inputMode(grid)).toBe('outer');

    grid = modelHelpers.clearTempInputMode(grid);
    expect(inputMode(grid)).toBe('color');

    grid = modelHelpers.setInputMode(grid, 'digit');
    expect(inputMode(grid)).toBe('digit');
});

test('set one digit', () => {
    let grid = newSudokuModel({initialDigits: initialDigitsPartial, skipCheck: true});

    expect(grid.get('currentSnapshot')).toBe('');
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 2);
    expect(grid.get('focusIndex')).toBe(2);

    grid = modelHelpers.updateSelectedCells(grid, 'setDigit', '9');

    expect(grid.get('focusIndex')).toBe(2);
    expect(grid.get('currentSnapshot')).toBe('13D9');
    expect(grid.get('matchDigit')).toBe('9');

    let c2 = grid.get('cells').get(2);
    expect(c2.get('digit')).toBe('9');
    expect(c2.get('snapshot')).toBe('D9');
    expect(c2.get('errorMessage')).toBe(undefined);
    expect(c2.get('isGiven')).toBe(false);
    expect(c2.get('isSelected')).toBe(true);

    grid = modelHelpers.applySelectionOp(grid, 'clearSelection');
    expect(grid.get('focusIndex')).toBe(2);
    c2 = grid.get('cells').get(2);
    expect(c2.get('isSelected')).toBe(false);

    expect(grid.get('currentSnapshot')).toBe('13D9');
    expect(grid.get('matchDigit')).toBe('0');
    expect(digitsFromGrid(grid)).toBe(
        '009008000' +
        '000007000' +
        '123456789' +
        '000005000' +
        '000004000' +
        '000003000' +
        '000002000' +
        '000001000' +
        '000009000'
    );
});

test('attempt overwrite of given digit', () => {
    let grid = newSudokuModel({initialDigits: initialDigitsPartial, skipCheck: true});

    expect(grid.get('currentSnapshot')).toBe('');

    let c41 = grid.get('cells').get(41);
    expect(c41.get('digit')).toBe('4');
    expect(c41.get('isGiven')).toBe(true);

    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 41);
    expect(grid.get('focusIndex')).toBe(41);
    expect(grid.get('matchDigit')).toBe('4');

    grid = modelHelpers.updateSelectedCells(grid, 'setDigit', '2');

    expect(grid.get('matchDigit')).toBe('4');
    c41 = grid.get('cells').get(41);
    expect(c41.get('digit')).toBe('4');
    expect(c41.get('isGiven')).toBe(true);

    expect(grid.get('currentSnapshot')).toBe('');
    expect(digitsFromGrid(grid)).toBe(initialDigitsPartial);
});

test('set multiple digits', () => {
    let grid = newSudokuModel({initialDigits: initialDigitsPartial, skipCheck: true});

    expect(grid.get('currentSnapshot')).toBe('');
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 47);
    expect(grid.get('focusIndex')).toBe(47);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 57);
    expect(grid.get('focusIndex')).toBe(57);
    grid = modelHelpers.updateSelectedCells(grid, 'setDigit', '2');

    expect(grid.get('currentSnapshot')).toBe('63D2,74D2');
    expect(grid.get('matchDigit')).toBe('2');

    expect(digitsFromGrid(grid)).toBe(
        '000008000' +
        '000007000' +
        '123456789' +
        '000005000' +
        '000004000' +
        '002003000' +
        '000202000' +
        '000001000' +
        '000009000'
    );

    let c47 = grid.get('cells').get(47);
    expect(c47.get('digit')).toBe('2');
    expect(c47.get('snapshot')).toBe('D2');
    expect(c47.get('errorMessage')).toBe(undefined);
    expect(c47.get('isGiven')).toBe(false);
    expect(c47.get('isSelected')).toBe(true);

    let c57 = grid.get('cells').get(57);
    expect(c57.get('digit')).toBe('2');
    expect(c57.get('snapshot')).toBe('D2');
    expect(c57.get('errorMessage')).toBe('Digit 2 in row 7');
    expect(c57.get('isGiven')).toBe(false);
    expect(c57.get('isSelected')).toBe(true);

    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 0);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 13);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 28);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 39);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 52);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 56);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 69);
    expect(grid.get('focusIndex')).toBe(69);
    grid = modelHelpers.updateSelectedCells(grid, 'setDigit', '9');

    expect(digitsFromGrid(grid)).toBe(
        '900008000' +
        '000097000' +
        '123456789' +
        '090005000' +
        '000904000' +
        '002003090' +
        '009202000' +
        '000001900' +
        '000009000'
    );
    expect(grid.get('currentSnapshot')).toBe('11D9,25D9,42D9,54D9,63D2,68D9,73D9,74D2,87D9');
    expect(grid.get('matchDigit')).toBe('9');
    expect(grid.get('completedDigits')).toStrictEqual({
        "1": false,
        "2": false,
        "3": false,
        "4": false,
        "5": false,
        "6": false,
        "7": false,
        "8": false,
        "9": true,
    });

    grid = modelHelpers.clearPencilmarks(grid);     // should have no effect
    expect(digitsFromGrid(grid)).toBe(
        '900008000' +
        '000097000' +
        '123456789' +
        '090005000' +
        '000904000' +
        '002003090' +
        '009202000' +
        '000001900' +
        '000009000'
    );
});

test('no highlight conflicts', () => {
    let grid = newSudokuModel({initialDigits: initialDigitsPartial, skipCheck: true});
    const settings = grid.get('settings');
    grid = grid.set('settings', { ...settings, [SETTINGS.highlightConflicts]: false });

    expect(grid.get('currentSnapshot')).toBe('');
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 47);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 57);
    grid = modelHelpers.updateSelectedCells(grid, 'setDigit', '2');

    expect(grid.get('currentSnapshot')).toBe('63D2,74D2');
    expect(grid.get('matchDigit')).toBe('2');

    expect(digitsFromGrid(grid)).toBe(
        '000008000' +
        '000007000' +
        '123456789' +
        '000005000' +
        '000004000' +
        '002003000' +
        '000202000' +
        '000001000' +
        '000009000'
    );

    let c47 = grid.get('cells').get(47);
    expect(c47.get('digit')).toBe('2');
    expect(c47.get('snapshot')).toBe('D2');
    expect(c47.get('errorMessage')).toBe(undefined);
    expect(c47.get('isGiven')).toBe(false);
    expect(c47.get('isSelected')).toBe(true);

    let c57 = grid.get('cells').get(57);
    expect(c57.get('digit')).toBe('2');
    expect(c57.get('snapshot')).toBe('D2');
    expect(c57.get('errorMessage')).toBe(undefined);   // error message suppressed
    expect(c57.get('isGiven')).toBe(false);
    expect(c57.get('isSelected')).toBe(true);

    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 0);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 13);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 28);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 39);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 52);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 56);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 69);
    expect(grid.get('focusIndex')).toBe(69);
    grid = modelHelpers.updateSelectedCells(grid, 'setDigit', '9');

    expect(digitsFromGrid(grid)).toBe(
        '900008000' +
        '000097000' +
        '123456789' +
        '090005000' +
        '000904000' +
        '002003090' +
        '009202000' +
        '000001900' +
        '000009000'
    );
    expect(grid.get('currentSnapshot')).toBe('11D9,25D9,42D9,54D9,63D2,68D9,73D9,74D2,87D9');
    expect(grid.get('matchDigit')).toBe('9');
    expect(grid.get('completedDigits')).toStrictEqual({
        "1": false,
        "2": false,
        "3": false,
        "4": false,
        "5": false,
        "6": false,
        "7": false,
        "8": false,
        "9": true,
    });
});

test('set cell color', () => {
    let grid = newSudokuModel({initialDigits: initialDigitsPartial, skipCheck: true});

    expect(grid.get('inputMode')).toBe('digit');

    expect(grid.get('currentSnapshot')).toBe('');
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 11);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 20);
    grid = modelHelpers.updateSelectedCells(grid, 'setCellColor', '4');

    expect(grid.get('currentSnapshot')).toBe('23C4,33C4');

    grid = modelHelpers.setInputMode(grid, 'color');
    grid = modelHelpers.applySelectionOp(grid, 'clearSelection');
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 11);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 20);
    grid = modelHelpers.updateSelectedCells(grid, 'setCellColor', '1');

    expect(grid.get('currentSnapshot')).toBe('');   // 1 is transparent bkgd

    grid = modelHelpers.updateSelectedCells(grid, 'setCellColor', '9');

    expect(grid.get('currentSnapshot')).toBe('23C9,33C9');
    expect(grid.get('inputMode')).toBe('color');

    grid = modelHelpers.updateSelectedCells(grid, 'clearCell', '1');

    expect(grid.get('currentSnapshot')).toBe('');

    grid = modelHelpers.updateSelectedCells(grid, 'setCellColor', '9');

    expect(grid.get('currentSnapshot')).toBe('23C9,33C9');

    grid = modelHelpers.applyModalAction(grid, 'clear-color-highlights-confirmed');

    expect(grid.get('currentSnapshot')).toBe('');
    expect(grid.get('inputMode')).toBe('digit');
});

test('set pencilmarks', () => {
    let grid = newSudokuModel({initialDigits: initialDigitsPartial, skipCheck: true});

    expect(grid.get('currentSnapshot')).toBe('');
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 0);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 74);
    grid = modelHelpers.updateSelectedCells(grid, 'setDigit', '7');

    expect(grid.get('currentSnapshot')).toBe('11D7,93D7');

    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 4);
    grid = modelHelpers.updateSelectedCells(grid, 'toggleOuterPencilMark', '1');
    expect(grid.get('matchDigit')).toBe('1');
    grid = modelHelpers.updateSelectedCells(grid, 'toggleOuterPencilMark', '2');
    grid = modelHelpers.updateSelectedCells(grid, 'toggleOuterPencilMark', '3');
    expect(grid.get('matchDigit')).toBe('3');

    expect(grid.get('currentSnapshot')).toBe('11D7,15T123,93D7');

    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 5); // a given digit
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 6);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 7);
    grid = modelHelpers.updateSelectedCells(grid, 'toggleOuterPencilMark', '2');
    expect(grid.get('matchDigit')).toBe('2');

    expect(grid.get('currentSnapshot')).toBe('11D7,15T123,17T2,18T2,93D7');

    grid = modelHelpers.updateSelectedCells(grid, 'toggleOuterPencilMark', '2');

    expect(grid.get('currentSnapshot')).toBe('11D7,15T13,93D7');

    grid = modelHelpers.updateSelectedCells(grid, 'toggleOuterPencilMark', '2');

    expect(grid.get('currentSnapshot')).toBe('11D7,15T123,17T2,18T2,93D7');

    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 4);
    grid = modelHelpers.updateSelectedCells(grid, 'toggleOuterPencilMark', '2');

    expect(grid.get('currentSnapshot')).toBe('11D7,15T13,17T2,18T2,93D7');

    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 3);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 4);
    grid = modelHelpers.updateSelectedCells(grid, 'toggleInnerPencilMark', '1');
    grid = modelHelpers.updateSelectedCells(grid, 'toggleInnerPencilMark', '3');
    expect(grid.get('matchDigit')).toBe('3');

    expect(grid.get('currentSnapshot')).toBe('11D7,14N13,15T13N13,17T2,18T2,93D7');

    let c4 = grid.get('cells').get(4);
    expect(pencilDigits(c4.get('innerPencils'))).toBe('13');
    let c6 = grid.get('cells').get(6);
    expect(pencilDigits(c6.get('outerPencils'))).toBe('2');

    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 3);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 12);
    grid = modelHelpers.updateSelectedCells(grid, 'toggleInnerPencilMark', '3');

    expect(grid.get('currentSnapshot')).toBe('11D7,14N13,15T13N13,17T2,18T2,24N3,93D7');

    grid = modelHelpers.updateSelectedCells(grid, 'toggleInnerPencilMark', '3');

    expect(grid.get('currentSnapshot')).toBe('11D7,14N1,15T13N13,17T2,18T2,93D7');

    grid = modelHelpers.updateSelectedCells(grid, 'toggleInnerPencilMark', '3');

    expect(grid.get('currentSnapshot')).toBe('11D7,14N13,15T13N13,17T2,18T2,24N3,93D7');

    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 12);
    grid = modelHelpers.updateSelectedCells(grid, 'toggleInnerPencilMark', '3');

    expect(grid.get('currentSnapshot')).toBe('11D7,14N13,15T13N13,17T2,18T2,93D7');

    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 13);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 14);
    grid = modelHelpers.updateSelectedCells(grid, 'setCellColor', '4');
    expect(grid.get('matchDigit')).toBe('0');

    expect(grid.get('currentSnapshot')).toBe('11D7,14N13,15T13N13,17T2,18T2,25C4,26C4,93D7');

    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 4);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 13);
    grid = modelHelpers.updateSelectedCells(grid, 'clearCell');
    expect(grid.get('matchDigit')).toBe('0');

    expect(grid.get('currentSnapshot')).toBe('11D7,14N13,17T2,18T2,26C4,93D7');

    grid = modelHelpers.clearPencilmarks(grid);
    expect(grid.get('focusIndex')).toBe(13);
    expect(grid.get('matchDigit')).toBe('0');

    expect(grid.get('currentSnapshot')).toBe('11D7,93D7');

    grid = modelHelpers.undoOneAction(grid);
    expect(grid.get('currentSnapshot')).toBe('11D7,14N13,17T2,18T2,26C4,93D7');
    grid = modelHelpers.undoOneAction(grid);
    expect(grid.get('currentSnapshot')).toBe('11D7,14N13,15T13N13,17T2,18T2,25C4,26C4,93D7');
    grid = modelHelpers.undoOneAction(grid);
    expect(grid.get('currentSnapshot')).toBe('11D7,14N13,15T13N13,17T2,18T2,93D7');
    grid = modelHelpers.undoOneAction(grid);
    expect(grid.get('currentSnapshot')).toBe('11D7,14N13,15T13N13,17T2,18T2,24N3,93D7');
    grid = modelHelpers.undoOneAction(grid);
    expect(grid.get('currentSnapshot')).toBe('11D7,14N1,15T13N13,17T2,18T2,93D7');
});

test('defaultDigitOpForSelection', () => {
    let grid = newSudokuModel({initialDigits: initialDigitsPartial, skipCheck: true});
    expect(modelHelpers.defaultDigitOpForSelection(grid)).toBe('setDigit');

    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 0);
    expect(modelHelpers.defaultDigitOpForSelection(grid)).toBe('setDigit');

    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 1);
    expect(modelHelpers.defaultDigitOpForSelection(grid)).toBe('toggleOuterPencilMark');

    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 0);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 12);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 42);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 73);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 47);
    const operation = modelHelpers.defaultDigitOpForSelection(grid);
    expect(operation).toBe('setDigit');

    grid = modelHelpers.updateSelectedCells(grid, operation, '5');
    expect(digitsFromGrid(grid)).toBe(
        '500008000' +
        '000507000' +
        '123456789' +
        '000005000' +
        '000004500' +
        '005003000' +
        '000002000' +
        '000001000' +
        '050009000'
    );

    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 3);
    grid = modelHelpers.updateSelectedCells(grid, 'toggleOuterPencilMark', '2');
    expect(grid.get('currentSnapshot')).toBe('11D5,14T2,24D5,57D5,63D5,92D5');

    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 4);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 5);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 12);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 13);
    grid = modelHelpers.updateSelectedCells(grid, 'toggleOuterPencilMark', '2');
    expect(grid.get('currentSnapshot')).toBe('11D5,14T2,15T2,24D5,25T2,57D5,63D5,92D5');

    grid = modelHelpers.updateSelectedCells(grid, 'toggleOuterPencilMark', '2');
    expect(grid.get('currentSnapshot')).toBe('11D5,24D5,57D5,63D5,92D5');
});

test('simple pencil marking mode', () => {
    let grid = newSudokuModel({initialDigits: initialDigitsPartial, skipCheck: true});
    expect(modelHelpers.getSetting(grid, SETTINGS.simplePencilMarking)).toBe(false);

    expect(grid.get('currentSnapshot')).toBe('');
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 0);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 1);
    grid = modelHelpers.updateSelectedCells(grid, 'toggleOuterPencilMark', '3');
    expect(grid.get('currentSnapshot')).toBe('11T3,12T3');

    grid = modelHelpers.collapseAllOuterPencilMarks(grid);
    expect(grid.get('currentSnapshot')).toBe('11N3,12N3');

    grid = newSudokuModel({initialDigits: initialDigitsPartial, skipCheck: true});
    const settings = grid.get('settings');
    grid = grid.set('settings', { ...settings, [SETTINGS.simplePencilMarking]: true });

    expect(grid.get('currentSnapshot')).toBe('');
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 0);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 1);
    grid = modelHelpers.updateSelectedCells(grid, 'toggleOuterPencilMark', '3');
    expect(grid.get('currentSnapshot')).toBe('11N3,12N3');
});

test('pencilMarksToInner', () => {
    const extend = true;
    let grid = newSudokuModel({initialDigits: initialDigitsPartial, skipCheck: true});
    expect(grid.get('showPencilmarks')).toBe(true);
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 63);
    grid = modelHelpers.moveFocus(grid, 0, 1, extend);
    expect(selectedCells(grid)).toBe('63,72');
    grid = modelHelpers.updateSelectedCells(grid, 'toggleOuterPencilMark', '4');
    grid = modelHelpers.updateSelectedCells(grid, 'toggleOuterPencilMark', '5');
    expect(grid.get('currentSnapshot')).toBe('81T45,91T45');
    grid = modelHelpers.updateSelectedCells(grid, 'pencilMarksToInner', '5');
    expect(grid.get('currentSnapshot')).toBe('81N45,91N45');
});

test('show/hide pencilmarks', () => {
    let grid = newSudokuModel({initialDigits: initialDigitsPartial, skipCheck: true});
    expect(grid.get('showPencilmarks')).toBe(true);
    grid = modelHelpers.toggleShowPencilmarks(grid)
    expect(grid.get('showPencilmarks')).toBe(false);
    grid = modelHelpers.toggleShowPencilmarks(grid)
    expect(grid.get('showPencilmarks')).toBe(true);
});

test('autoclean pencilmarks', () => {
    let grid = newSudokuModel({initialDigits: initialDigitsPartial, skipCheck: true});
    expect(digitsFromGrid(grid)).toBe(initialDigitsPartial);
    let startingSnapshot = '14N39,15N39,45N17,65N17,71T3,74N35,89T3,91T34,93T4,99T3';
    expect(grid.get('currentSnapshot')).toBe('');
    grid = modelHelpers.restoreSnapshot(grid, startingSnapshot)
    expect(grid.get('currentSnapshot')).toBe(startingSnapshot);
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 76);
    grid = modelHelpers.updateSelectedCells(grid, 'setDigit', '3');
    expect(digitsFromGrid(grid)).toBe(
        '000008000' +
        '000007000' +
        '123456789' +
        '000005000' +
        '000004000' +
        '000003000' +
        '000002000' +
        '000001000' +
        '000039000'
    );
    expect(grid.get('currentSnapshot')).toBe('14N39,15N9,45N17,65N17,71T3,74N5,89T3,91T4,93T4,95D3');
});

test('clear all colours', () => {
    let grid = newSudokuModel({initialDigits: initialDigitsPartial, skipCheck: true});
    expect(digitsFromGrid(grid)).toBe(initialDigitsPartial);
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 3);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 4);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 5);
    grid = modelHelpers.updateSelectedCells(grid, 'setCellColor', '2');
    expect(grid.get('currentSnapshot')).toBe('14C2,15C2,16C2');
    expect(grid.get('undoList').size).toBe(1);
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 12);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 13);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 14);
    grid = modelHelpers.updateSelectedCells(grid, 'setCellColor', '4');
    expect(grid.get('undoList').size).toBe(2);
    expect(grid.get('currentSnapshot')).toBe('14C2,15C2,16C2,24C4,25C4,26C4');
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 21);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 22);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 23);
    grid = modelHelpers.updateSelectedCells(grid, 'setCellColor', '5');
    expect(grid.get('undoList').size).toBe(3);
    expect(grid.get('currentSnapshot')).toBe('14C2,15C2,16C2,24C4,25C4,26C4,34C5,35C5,36C5');
    grid = modelHelpers.applyModalAction(grid, 'clear-color-highlights-confirmed');
    expect(grid.get('undoList').size).toBe(4);
    expect(grid.get('cells').get(4).get('colorCode')).toBe('1');
    expect(grid.get('currentSnapshot')).toBe('');
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 6);
    grid = modelHelpers.updateSelectedCells(grid, 'setDigit', '7');
    expect(grid.get('undoList').size).toBe(5);
    expect(grid.get('currentSnapshot')).toBe('17D7');
    grid = modelHelpers.undoOneAction(grid);
    expect(grid.get('currentSnapshot')).toBe('');
    grid = modelHelpers.undoOneAction(grid);
    expect(grid.get('currentSnapshot')).toBe('14C2,15C2,16C2,24C4,25C4,26C4,34C5,35C5,36C5');
    grid = modelHelpers.undoOneAction(grid);
    expect(grid.get('currentSnapshot')).toBe('14C2,15C2,16C2,24C4,25C4,26C4');
    grid = modelHelpers.undoOneAction(grid);
    expect(grid.get('currentSnapshot')).toBe('14C2,15C2,16C2');
    grid = modelHelpers.undoOneAction(grid);
    expect(grid.get('currentSnapshot')).toBe('');
});

test('check digits', () => {
    let result = modelHelpers.checkDigits(
        '000000000' +
        '000000000' +
        '000000000' +
        '000000000' +
        '000000000' +
        '000000000' +
        '000000000' +
        '000000000' +
        '000000000'
    );
    expect(result).toStrictEqual({
        isSolved: false,
        incompleteCount: 81,
        completedDigits: {
            "1": false,
            "2": false,
            "3": false,
            "4": false,
            "5": false,
            "6": false,
            "7": false,
            "8": false,
            "9": false,
        },
    });

    result = modelHelpers.checkDigits(
        '000000000' +
        '000000000' +
        '000000000' +
        '000500000' +
        '000000000' +
        '000005000' +
        '000000000' +
        '000000000' +
        '000000000'
    );
    expect(result).toStrictEqual({
        isSolved: false,
        hasErrors: true,
        errorAtIndex: {
            30: "Digit 5 in box 5",
            50: "Digit 5 in box 5",
        },
        completedDigits: {
            "1": false,
            "2": false,
            "3": false,
            "4": false,
            "5": false,
            "6": false,
            "7": false,
            "8": false,
            "9": false,
        },
    });

    result = modelHelpers.checkDigits(
        '506500200' +
        '000006005' +
        '000000006' +
        '760005200' +
        '005060007' +
        '007000650' +
        '600000500' +
        '000650000' +
        '050000060'
    );
    expect(result).toStrictEqual({
        isSolved: false,
        hasErrors: true,
        errorAtIndex: {
            0: "Digit 5 in row 1",
            3: "Digit 5 in row 1",
            6: "Digit 2 in col 7",
            33: "Digit 2 in col 7",
            27: "Digit 7 in box 4",
            47: "Digit 7 in box 4",
        },
        completedDigits: {
            "1": false,
            "2": false,
            "3": false,
            "4": false,
            "5": false,
            "6": true,
            "7": false,
            "8": false,
            "9": false,
        },
    });

    result = modelHelpers.checkDigits(
        '000901230' +
        '123008940' +
        '894007650' +
        '765000009' +
        '000090000' +
        '900000123' +
        '012300894' +
        '089400765' +
        '076509000',
        finalDigitsComplete
    );
    expect(result).toStrictEqual({
        isSolved: false,
        incompleteCount: 40,
        completedDigits: {
            "1": false,
            "2": false,
            "3": false,
            "4": false,
            "5": false,
            "6": false,
            "7": false,
            "8": false,
            "9": true,
        },
    });

    result = modelHelpers.checkDigits(
        '500901230' +
        '123008940' +
        '894007650' +
        '765000009' +
        '000090000' +
        '900000123' +
        '012300894' +
        '089400765' +
        '076509001',
        finalDigitsComplete
    );
    expect(result).toStrictEqual({
        isSolved: false,
        hasErrors: true,
        errorAtIndex: {
            "0": "Incorrect digit",
            "80": "Incorrect digit",
        },
        completedDigits: {
            "1": false,
            "2": false,
            "3": false,
            "4": false,
            "5": false,
            "6": false,
            "7": false,
            "8": false,
            "9": true,
        },
    });

    result = modelHelpers.checkDigits(
        '123456789' +
        '456789123' +
        '789123456' +
        '234567891' +
        '567891234' +
        '891234567' +
        '345678912' +
        '678912345' +
        '912345678'
    );
    expect(result).toStrictEqual({
        isSolved: true,
        completedDigits: {
            "1": true,
            "2": true,
            "3": true,
            "4": true,
            "5": true,
            "6": true,
            "7": true,
            "8": true,
            "9": true,
        },
    });
});
