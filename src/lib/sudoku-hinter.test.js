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

const initialDigitsEasyGrid =
    '000000250' +
    '620041030' +
    '800230000' +
    '080905700' +
    '047080960' +
    '006104080' +
    '000019008' +
    '070450019' +
    '061000000';

test('check calculateCellCandidates() no SN', () => {
    let grid = newSudokuModel({initialDigits, skipCheck: true});
    const hinter = modelHelpers.hinter(grid);
    const candidates = hinter.calculateCellCandidates();
    expect(Array.isArray(candidates)).toBe(true);
    expect(candidates.length).toBe(81);
    expect(candidates[0]).toStrictEqual([ '5', '6', '9' ]);
    expect(candidates[1]).toStrictEqual([ '5', '9' ]);
    expect(candidates[2]).toStrictEqual([ '7', '9' ]);
    expect(candidates[3]).toStrictEqual([ '6', '9' ]);
    expect(candidates[4]).toStrictEqual([ '4', '5', '6', '9' ]);
    expect(candidates[5]).toStrictEqual(null);
    expect(candidates[6]).toStrictEqual(null);
    expect(candidates[7]).toStrictEqual(null);
    expect(candidates[8]).toStrictEqual([ '7', '8', '9' ]);
    expect(candidates[9]).toStrictEqual(null);
    expect(candidates[10]).toStrictEqual(null);
    expect(candidates[11]).toStrictEqual(null);
    expect(candidates[12]).toStrictEqual([ '6', '9' ]);
    expect(candidates[13]).toStrictEqual([ '5', '6', '9' ]);
    expect(candidates[14]).toStrictEqual(null);
    expect(candidates[15]).toStrictEqual([ '9' ]);
    expect(candidates[16]).toStrictEqual(null);
    expect(candidates[17]).toStrictEqual([ '7', '9' ]);
    expect(candidates[18]).toStrictEqual(null);
    expect(candidates[19]).toStrictEqual([ '9' ]);
    expect(candidates[20]).toStrictEqual(null);
    expect(candidates[21]).toStrictEqual([ '2', '9' ]);
    expect(candidates[22]).toStrictEqual([ '2', '3', '9' ]);
    expect(candidates[23]).toStrictEqual(null);
    expect(candidates[24]).toStrictEqual(null);
    expect(candidates[25]).toStrictEqual(null);
    expect(candidates[26]).toStrictEqual([ '1', '9' ]);
    expect(candidates[27]).toStrictEqual(null);
    expect(candidates[28]).toStrictEqual(null);
    expect(candidates[29]).toStrictEqual(null);
    expect(candidates[30]).toStrictEqual([ '1', '2', '8', '9' ]);
    expect(candidates[31]).toStrictEqual([ '1', '2', '3', '4', '8', '9' ]);
    expect(candidates[32]).toStrictEqual([ '2', '3', '4', '9' ]);
    expect(candidates[33]).toStrictEqual([ '4', '9' ]);
    expect(candidates[34]).toStrictEqual([ '8', '9' ]);
    expect(candidates[35]).toStrictEqual([ '8', '9' ]);
    expect(candidates[36]).toStrictEqual([ '2', '3', '4', '9' ]);
    expect(candidates[37]).toStrictEqual([ '3', '4', '9' ]);
    expect(candidates[38]).toStrictEqual([ '1', '8', '9' ]);
    expect(candidates[39]).toStrictEqual([ '1', '2', '6', '7', '8', '9' ]);
    expect(candidates[40]).toStrictEqual([ '1', '2', '3', '4', '5', '6', '7', '8', '9' ]);
    expect(candidates[41]).toStrictEqual([ '2', '3', '4', '5', '6', '9' ]);
    expect(candidates[42]).toStrictEqual([ '4', '5', '9' ]);
    expect(candidates[43]).toStrictEqual([ '7', '8', '9' ]);
    expect(candidates[44]).toStrictEqual([ '6', '7', '8', '9' ]);
    expect(candidates[45]).toStrictEqual([ '4', '9' ]);
    expect(candidates[46]).toStrictEqual([ '4', '9' ]);
    expect(candidates[47]).toStrictEqual([ '8', '9' ]);
    expect(candidates[48]).toStrictEqual([ '6', '7', '8', '9' ]);
    expect(candidates[49]).toStrictEqual([ '4', '5', '6', '7', '8', '9' ]);
    expect(candidates[50]).toStrictEqual([ '4', '5', '6', '9' ]);
    expect(candidates[51]).toStrictEqual(null);
    expect(candidates[52]).toStrictEqual(null);
    expect(candidates[53]).toStrictEqual(null);
    expect(candidates[54]).toStrictEqual([ '5', '9' ]);
    expect(candidates[55]).toStrictEqual(null);
    expect(candidates[56]).toStrictEqual(null);
    expect(candidates[57]).toStrictEqual(null);
    expect(candidates[58]).toStrictEqual([ '6', '7', '9' ]);
    expect(candidates[59]).toStrictEqual([ '6', '9' ]);
    expect(candidates[60]).toStrictEqual(null);
    expect(candidates[61]).toStrictEqual([ '9' ]);
    expect(candidates[62]).toStrictEqual(null);
    expect(candidates[63]).toStrictEqual([ '3', '9' ]);
    expect(candidates[64]).toStrictEqual(null);
    expect(candidates[65]).toStrictEqual([ '9' ]);
    expect(candidates[66]).toStrictEqual(null);
    expect(candidates[67]).toStrictEqual([ '1', '2', '9' ]);
    expect(candidates[68]).toStrictEqual([ '2', '9' ]);
    expect(candidates[69]).toStrictEqual(null);
    expect(candidates[70]).toStrictEqual(null);
    expect(candidates[71]).toStrictEqual(null);
    expect(candidates[72]).toStrictEqual([ '3', '4', '9' ]);
    expect(candidates[73]).toStrictEqual(null);
    expect(candidates[74]).toStrictEqual(null);
    expect(candidates[75]).toStrictEqual(null);
    expect(candidates[76]).toStrictEqual([ '1', '2', '8', '9' ]);
    expect(candidates[77]).toStrictEqual([ '2', '9' ]);
    expect(candidates[78]).toStrictEqual([ '3', '9' ]);
    expect(candidates[79]).toStrictEqual([ '1', '9' ]);
    expect(candidates[80]).toStrictEqual([ '1', '2', '9' ]);

    const grid2 = modelHelpers.showCalculatedCandidates(grid);
    expect(grid2.get('currentSnapshot')).toBe(
        '11N569,12N59,13N79,14N69,15N4569,19N789,' +
        '24N69,25N569,27N9,29N79,' +
        '32N9,34N29,35N239,39N19,' +
        '44N1289,45N123489,46N2349,47N49,48N89,49N89,' +
        '51N2349,52N349,53N189,54N126789,55N123456789,56N234569,57N459,58N789,59N6789,' +
        '61N49,62N49,63N89,64N6789,65N456789,66N4569,' +
        '71N59,75N679,76N69,78N9,' +
        '81N39,83N9,85N129,86N29,' +
        '91N349,95N1289,96N29,97N39,98N19,99N129'
    );
});

test('check calculateCellCandidates() with SN', () => {
    let grid = newSudokuModel({initialDigits: initialDigitsEasyGrid, skipCheck: true});
    expect(grid.get('currentSnapshot')).toBe('');
    let startingSnapshot = '12T1,32T1,41T1,49T1,51T1,59T1';
    grid = modelHelpers.restoreSnapshot(grid, startingSnapshot)
    expect(grid.get('currentSnapshot')).toBe(startingSnapshot);

    const hinter = modelHelpers.hinter(grid);
    expect(hinter.hasDigitInRegion('1', 'box', 1)).toBe(false);
    expect(hinter.hasDigitInRegion('1', 'box', 4)).toBe(false);
    expect(hinter.hasDigitInRegion('1', 'box', 7)).toBe(true);
    expect(hinter.hasDigitInRegion('1', 'col', 1)).toBe(false);
    expect(hinter.hasDigitInRegion('1', 'col', 2)).toBe(false);
    expect(hinter.hasDigitInRegion('1', 'col', 3)).toBe(true);
    expect(hinter.digitIsRestrictedElsewhereInBox(1, '1', 0)).toBe(true);
    expect(hinter.digitIsRestrictedElsewhereInBox(1, '1', 1)).toBe(false);
    expect(hinter.digitIsRestrictedElsewhereInBox(1, '1', 2)).toBe(true);
    expect(hinter.digitIsRestrictedElsewhereInBox(3, '1', 8)).toBe(false);

    const candidates = hinter.calculateCellCandidates();
    expect(Array.isArray(candidates)).toBe(true);
    expect(candidates.length).toBe(81);
    expect(candidates[0]).toStrictEqual([ '3', '4', '7', '9' ]);

    const grid2 = modelHelpers.showCalculatedCandidates(grid);
    expect(grid2.get('currentSnapshot')).toBe(
        '11N3479,12N139,13N349,14N678,15N679,16N678,19N1467,' +
        '23N59,24N578,27N8,29N7,' +
        '32N159,33N459,36N67,37N146,38N479,39N1467,' +
        '41N123,43N23,45N26,48N24,49N1234,' +
        '51N1235,54N3,56N23,59N1235,' +
        '61N2359,62N359,65N27,67N35,69N235,' +
        '71N2345,72N35,73N2345,74N367,77N3456,78N247,' +
        '81N23,83N238,86N2368,87N36,' +
        '91N23459,94N378,95N27,96N2378,97N345,98N247,99N23457'
    );
});
