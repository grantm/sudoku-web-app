import { modelHelpers } from './sudoku-model.js';

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
    const solutions = modelHelpers.findSolutions(d);
    expect(solutions).toStrictEqual([
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
    const d = (
        '000001230' +
        '123008040' +
        '804007650' +
        '765000000' +
        '000000000' +
        '000000123' +
        '012300800' +
        '080400000' +
        '076500000'
    ).split('');
    const solutions = modelHelpers.findSolutions(d);
    expect(solutions).toStrictEqual([
        "657941238123658749894237651765123984231894567948765123412376895589412376376589412",
        "657941238123658749894237651765123984231894576948765123412376895589412367376589412",
    ]);
});

test('findSolutions - multiple solutions - all', () => {
    const d = (
        '000001230' +
        '123008040' +
        '804007650' +
        '765000000' +
        '000000000' +
        '000000123' +
        '012300800' +
        '080400000' +
        '076500000'
    ).split('');
    const solutions = modelHelpers.findSolutions(d, true);
    expect(solutions).toStrictEqual([
        "657941238123658749894237651765123984231894567948765123412376895589412376376589412",
        "657941238123658749894237651765123984231894576948765123412376895589412367376589412",
        "657941238123658947894237651765123489231894576948765123512376894389412765476589312",
        "657941238123658947894237651765123489231894765948765123512376894389412576476589312",
    ]);
});

test('findSolutions - no solutions', () => {
    const d = (
        '500001230' +
        '123008040' +
        '804007650' +
        '765000000' +
        '000000000' +
        '000000123' +
        '012300804' +
        '080400765' +
        '076500000'
    ).split('');
    const solutions = modelHelpers.findSolutions(d);
    expect(solutions).toStrictEqual([]);
});
