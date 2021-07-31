import { modelHelpers, newSudokuModel } from './sudoku-model';

const initialDigits =
    '000001230' +
    '123008040' +
    '804007650' +
    '765000000' +
    '000000000' +
    '000000123' +
    '012300804' +
    '080400765' +
    '076500000';

const initialDigitsNonUnique =
    '000001230' +
    '123008040' +
    '804007650' +
    '765000000' +
    '000000000' +
    '000000123' +
    '012300800' +
    '080400000' +
    '076500000';

const initialDigitsNoSolution =
    '500001230' +
    '123008040' +
    '804007650' +
    '765000000' +
    '000000000' +
    '000000123' +
    '012300804' +
    '080400765' +
    '076500000';

const initialDigitsTooFewGivens =
    '123456789' +
    '000000000' +
    '000000000' +
    '000000000' +
    '000000000' +
    '000000000' +
    '000000000' +
    '000000000' +
    '765432100';

const initialDigitsPathological =
    '098700000' +
    '000000000' +
    '000000000' +
    '000000000' +
    '034567891' +
    '000000000' +
    '000000000' +
    '000000000' +
    '023456789';

test('findCandidatesForCell', () => {
    const d = initialDigits.split('');
    expect(d[0]).toBe('0');
    expect(d[5]).toBe('1');
    expect(d[10]).toBe('2');
    expect(modelHelpers.findCandidatesForCell(d, 0)).toStrictEqual(['5', '6', '9']);
    expect(modelHelpers.findCandidatesForCell(d, 1)).toStrictEqual(['5', '9']);
    expect(modelHelpers.findCandidatesForCell(d, 19)).toStrictEqual(['9']);
    expect(modelHelpers.findCandidatesForCell(d, 40)).toStrictEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
});

test('findSolutions - unique solution', () => {
    const d = initialDigits.split('');
    const result = modelHelpers.findSolutions(d);
    expect(result.uniqueSolution).toBe(true);
    expect(result.error).toBe(undefined);
    expect(result.solutions).toStrictEqual([
        '657941238' +
        '123658947' +
        '894237651' +
        '765123489' +
        '231894576' +
        '948765123' +
        '512376894' +
        '389412765' +
        '476589312'
    ]);
});

test('findSolutions - multiple solutions - first two', () => {
    const d = initialDigitsNonUnique.split('');
    const result = modelHelpers.findSolutions(d);
    expect(result.uniqueSolution).toBe(false);
    expect(result.error).toBe('This arrangement does not have a unique solution');
    expect(result.solutions).toStrictEqual([
        "657941238123658749894237651765123984231894567948765123412376895589412376376589412",
        "657941238123658749894237651765123984231894576948765123412376895589412367376589412",
    ]);
});

test('findSolutions - multiple solutions - all', () => {
    const d = initialDigitsNonUnique.split('');
    const result = modelHelpers.findSolutions(d, { findAll: true });
    expect(result.uniqueSolution).toBe(false);
    expect(result.error).toBe('This arrangement does not have a unique solution');
    expect(result.solutions).toStrictEqual([
        "657941238123658749894237651765123984231894567948765123412376895589412376376589412",
        "657941238123658749894237651765123984231894576948765123412376895589412367376589412",
        "657941238123658947894237651765123489231894576948765123512376894389412765476589312",
        "657941238123658947894237651765123489231894765948765123512376894389412576476589312",
    ]);
});

test('findSolutions - no solutions', () => {
    const d = initialDigitsNoSolution.split('');
    const result = modelHelpers.findSolutions(d);
    expect(result.uniqueSolution).toBe(false);
    expect(result.error).toBe('This arrangement does not have a solution');
    expect(result.solutions).toStrictEqual([]);
});

test('findSolutions - too few givens', () => {
    const d = initialDigitsTooFewGivens.split('');
    const result = modelHelpers.findSolutions(d, {timeout: 100});
    expect(result.uniqueSolution).toBe(false);
    expect(result.error).toBe('This arrangement may not have a unique solution');
    expect(result.solutions).toStrictEqual([]);
});

test('findSolutions - timeout', () => {
    const d = initialDigitsPathological.split('');
    const result = modelHelpers.findSolutions(d, {timeout: 100});
    expect(result.uniqueSolution).toBe(false);
    expect(result.error).toBe('The solver timed out while checking for a unique solution');
    expect(result.solutions).toStrictEqual([]);
});

test('check initialDigits', () => {
    let grid = newSudokuModel({initialDigits, skipCheck: false});
    expect(grid.get('modalState')).toStrictEqual(undefined);
    expect(grid.get('finalDigits')).toBe(
        "657941238123658947894237651765123489231894576948765123512376894389412765476589312"
    );

    grid = newSudokuModel({initialDigits, skipCheck: true});
    expect(grid.get('modalState')).toStrictEqual(undefined);
    expect(grid.get('finalDigits')).toBe(undefined);

    grid = newSudokuModel({initialDigits: initialDigitsNonUnique});
    expect(grid.get('modalState')).toStrictEqual({
        "modalType": "check-result",
        "icon": "warning",
        "errorMessage": "This arrangement does not have a unique solution",
        "escapeAction": "close",
    });

    grid = newSudokuModel({initialDigits: initialDigitsNoSolution});
    expect(grid.get('modalState')).toStrictEqual({
        "modalType": "check-result",
        "icon": "warning",
        "errorMessage": "This arrangement does not have a solution",
        "escapeAction": "close",
    });
});
