import { newSudokuModel, modelHelpers } from './sudoku-model.js';
import { List } from 'immutable';

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

function mapPropNames (map) {
    // Not sure why map.keys() doesn't work
    return Object.keys( map.toObject() ).sort();
}

function digitsFromGrid(grid) {
    return grid.get('cells').map(c => c.get('digit')).join('');
}

function pencilDigits (set) {
    return set.toArray().join('');
}

test('initialise grid', () => {
    let grid = newSudokuModel({initialDigits});

    const propNames = mapPropNames(grid);
    expect(propNames).toStrictEqual([
        "cells",
        "completedDigits",
        "currentSnapshot",
        "endTime",
        "focusIndex",
        "initialDigits",
        "inputMode",
        "matchDigit",
        "modalState",
        "mode",
        "pausedAt",
        "redoList",
        "solved",
        "startTime",
        "storeCurrentSnapshot",
        "tempInputMode",
        "undoList",
    ]);

    expect(digitsFromGrid(grid)).toBe(initialDigits);
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
    expect(grid.get('initialDigits')).toBe(initialDigits);
    expect(grid.get('inputMode')).toBe('digit');
    expect(grid.get('matchDigit')).toBe('0');
    expect(grid.get('modalState')).toBe(undefined);
    expect(grid.get('mode')).toBe('play');
    expect(grid.get('pausedAt')).toBe(undefined);
    expect(grid.get('redoList').size).toBe(0);
    expect(grid.get('solved')).toBe(false);
    expect(grid.get('startTime')/1000).toBeCloseTo(Date.now()/1000, 0);
    expect(grid.get('storeCurrentSnapshot')).toBe(undefined);
    expect(grid.get('tempInputMode')).toBe(undefined);
    expect(grid.get('undoList').size).toBe(0);
});

test('initialise grid cells', () => {
    let grid = newSudokuModel({initialDigits});

    // Expected pattern of given digits have been set up
    const cells = grid.get('cells');
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
        "colorCode",
        "column",
        "digit",
        "index",
        "innerPencils",
        "isError",
        "isGiven",
        "isSelected",
        "location",
        "outerPencils",
        "row",
        "snapshot",
        "x",
        "y",
    ]);
    expect(c0.get('box')).toBe(1);
    expect(c0.get('colorCode')).toBe('1');
    expect(c0.get('column')).toBe(1);
    expect(c0.get('digit')).toBe('0');
    expect(c0.get('index')).toBe(0);
    expect(c0.get('innerPencils').toArray()).toStrictEqual([]);
    expect(c0.get('isError')).toBe(false);
    expect(c0.get('isGiven')).toBe(false);
    expect(c0.get('isSelected')).toBe(false);
    expect(c0.get('location')).toBe('R1C1');
    expect(c0.get('outerPencils').toArray()).toStrictEqual([]);
    expect(c0.get('row')).toBe(1);
    expect(c0.get('snapshot')).toBe('');
    expect(c0.get('x')).toBe(50);
    expect(c0.get('y')).toBe(50);

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

    expect(cells.get(36).get('column')).toBe(1);
    expect(cells.get(37).get('column')).toBe(2);
    expect(cells.get(38).get('column')).toBe(3);
    expect(cells.get(39).get('column')).toBe(4);
    expect(cells.get(40).get('column')).toBe(5);
    expect(cells.get(41).get('column')).toBe(6);
    expect(cells.get(42).get('column')).toBe(7);
    expect(cells.get(43).get('column')).toBe(8);
    expect(cells.get(44).get('column')).toBe(9);

    expect(cells.get(8).get('location')).toBe('R1C9');
    expect(cells.get(16).get('location')).toBe('R2C8');
    expect(cells.get(24).get('location')).toBe('R3C7');
    expect(cells.get(32).get('location')).toBe('R4C6');
    expect(cells.get(40).get('location')).toBe('R5C5');
    expect(cells.get(48).get('location')).toBe('R6C4');
    expect(cells.get(56).get('location')).toBe('R7C3');
    expect(cells.get(64).get('location')).toBe('R8C2');
    expect(cells.get(72).get('location')).toBe('R9C1');
});

test('move input focus', () => {
    let grid = newSudokuModel({initialDigits});
    const move = false;     // No ctrl or shift
    const extend = true;    // Ctrl or shift

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
    expect(grid.get('focusIndex')).toBe(0)
    ;
    grid = modelHelpers.moveFocus(grid, 0, -1, move);
    expect(grid.get('focusIndex')).toBe(72);

    grid = modelHelpers.moveFocus(grid, 0, 1, move);
    expect(grid.get('focusIndex')).toBe(0);

    // 'Home'
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', modelHelpers.CENTER_CELL);
    expect(grid.get('focusIndex')).toBe(40)

    expect(grid.get('currentSnapshot')).toBe('');
});

test('input mode', () => {
    let grid = newSudokuModel({initialDigits});

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
    let grid = newSudokuModel({initialDigits});

    expect(grid.get('currentSnapshot')).toBe('');
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 2);
    expect(grid.get('focusIndex')).toBe(2);

    grid = modelHelpers.updateSelectedCells(grid, 'setDigit', '9');

    expect(grid.get('focusIndex')).toBe(2);
    expect(grid.get('currentSnapshot')).toBe('02D9');
    expect(grid.get('matchDigit')).toBe('9');

    let c2 = grid.get('cells').get(2);
    expect(c2.get('digit')).toBe('9');
    expect(c2.get('snapshot')).toBe('D9');
    expect(c2.get('isError')).toBe(false);
    expect(c2.get('isGiven')).toBe(false);
    expect(c2.get('isSelected')).toBe(true);

    grid = modelHelpers.applySelectionOp(grid, 'clearSelection');
    expect(grid.get('focusIndex')).toBe(2);
    c2 = grid.get('cells').get(2);
    expect(c2.get('isSelected')).toBe(false);

    expect(grid.get('currentSnapshot')).toBe('02D9');
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
    let grid = newSudokuModel({initialDigits});

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
    expect(digitsFromGrid(grid)).toBe(initialDigits);
});

test('set multiple digits', () => {
    let grid = newSudokuModel({initialDigits});

    expect(grid.get('currentSnapshot')).toBe('');
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 47);
    expect(grid.get('focusIndex')).toBe(47);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 57);
    expect(grid.get('focusIndex')).toBe(57);
    grid = modelHelpers.updateSelectedCells(grid, 'setDigit', '2');

    expect(grid.get('currentSnapshot')).toBe('47D2,57D2');
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
    expect(c47.get('isError')).toBe(false);
    expect(c47.get('isGiven')).toBe(false);
    expect(c47.get('isSelected')).toBe(true);

    let c57 = grid.get('cells').get(57);
    expect(c57.get('digit')).toBe('2');
    expect(c57.get('snapshot')).toBe('D2');
    expect(c57.get('isError')).toBe(true);
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
    expect(grid.get('currentSnapshot')).toBe('00D9,13D9,28D9,39D9,47D2,52D9,56D9,57D2,69D9');
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

test('set cell color', () => {
    let grid = newSudokuModel({initialDigits});

    expect(grid.get('currentSnapshot')).toBe('');
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 11);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 20);
    grid = modelHelpers.updateSelectedCells(grid, 'setCellColor', '4');

    expect(grid.get('currentSnapshot')).toBe('11C4,20C4');

    grid = modelHelpers.applySelectionOp(grid, 'clearSelection');
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 11);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 20);
    grid = modelHelpers.updateSelectedCells(grid, 'setCellColor', '1');

    expect(grid.get('currentSnapshot')).toBe('');

    grid = modelHelpers.updateSelectedCells(grid, 'setCellColor', '9');

    expect(grid.get('currentSnapshot')).toBe('11C9,20C9');

    grid = modelHelpers.updateSelectedCells(grid, 'clearCell', '1');

    expect(grid.get('currentSnapshot')).toBe('');
});

test('set pencilmarks', () => {
    let grid = newSudokuModel({initialDigits});

    expect(grid.get('currentSnapshot')).toBe('');
    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 0);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 74);
    grid = modelHelpers.updateSelectedCells(grid, 'setDigit', '7');

    expect(grid.get('currentSnapshot')).toBe('00D7,74D7');

    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 4);
    grid = modelHelpers.updateSelectedCells(grid, 'toggleOuterPencilMark', '1');
    expect(grid.get('matchDigit')).toBe('1');
    grid = modelHelpers.updateSelectedCells(grid, 'toggleOuterPencilMark', '2');
    grid = modelHelpers.updateSelectedCells(grid, 'toggleOuterPencilMark', '3');
    expect(grid.get('matchDigit')).toBe('3');

    expect(grid.get('currentSnapshot')).toBe('00D7,04T123,74D7');

    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 5); // a given digit
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 6);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 7);
    grid = modelHelpers.updateSelectedCells(grid, 'toggleOuterPencilMark', '2');
    expect(grid.get('matchDigit')).toBe('2');

    expect(grid.get('currentSnapshot')).toBe('00D7,04T13,06T2,07T2,74D7');

    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 3);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 4);
    grid = modelHelpers.updateSelectedCells(grid, 'toggleInnerPencilMark', '1');
    grid = modelHelpers.updateSelectedCells(grid, 'toggleInnerPencilMark', '3');
    expect(grid.get('matchDigit')).toBe('3');

    expect(grid.get('currentSnapshot')).toBe('00D7,03N13,04T13N13,06T2,07T2,74D7');

    let c4 = grid.get('cells').get(4);
    expect(pencilDigits(c4.get('innerPencils'))).toBe('13');
    let c6 = grid.get('cells').get(6);
    expect(pencilDigits(c6.get('outerPencils'))).toBe('2');

    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 13);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 14);
    grid = modelHelpers.updateSelectedCells(grid, 'setCellColor', '4');
    expect(grid.get('matchDigit')).toBe('0');

    expect(grid.get('currentSnapshot')).toBe('00D7,03N13,04T13N13,06T2,07T2,13C4,14C4,74D7');

    grid = modelHelpers.applySelectionOp(grid, 'setSelection', 4);
    grid = modelHelpers.applySelectionOp(grid, 'extendSelection', 13);
    grid = modelHelpers.updateSelectedCells(grid, 'clearCell');
    expect(grid.get('matchDigit')).toBe('0');

    expect(grid.get('currentSnapshot')).toBe('00D7,03N13,06T2,07T2,14C4,74D7');

    grid = modelHelpers.clearPencilmarks(grid);
    expect(grid.get('focusIndex')).toBe(13);
    expect(grid.get('matchDigit')).toBe('0');

    expect(grid.get('currentSnapshot')).toBe('00D7,74D7');

    grid = modelHelpers.undoOneAction(grid);
    expect(grid.get('currentSnapshot')).toBe('00D7,03N13,06T2,07T2,14C4,74D7');
    grid = modelHelpers.undoOneAction(grid);
    expect(grid.get('currentSnapshot')).toBe('00D7,03N13,04T13N13,06T2,07T2,13C4,14C4,74D7');
    grid = modelHelpers.undoOneAction(grid);
    expect(grid.get('currentSnapshot')).toBe('00D7,03N13,04T13N13,06T2,07T2,74D7');
    grid = modelHelpers.undoOneAction(grid);
    expect(grid.get('currentSnapshot')).toBe('00D7,03N1,04T13N1,06T2,07T2,74D7');
    grid = modelHelpers.undoOneAction(grid);
    expect(grid.get('currentSnapshot')).toBe('00D7,04T13,06T2,07T2,74D7');
});
