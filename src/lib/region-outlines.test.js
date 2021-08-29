import { calculateOutlinePath } from './region-outlines';

test('empty set', () => {
    const inputSet = [];
    expect(calculateOutlinePath(inputSet)).toStrictEqual([]);
});

test('single cell', () => {
    const inputSet = [10];
    expect(calculateOutlinePath(inputSet)).toStrictEqual([
        [10, 0, 'm'],
        [10, 1, 'd'],
        [10, 2, 'l'],
        [10, 3, 'u'],
        [10, 0, 'r'],
    ]);
});

test('separate cells', () => {
    const inputSet = [11, 13];
    expect(calculateOutlinePath(inputSet)).toStrictEqual([
        [11, 0, 'm'],
        [11, 1, 'd'],
        [11, 2, 'l'],
        [11, 3, 'u'],
        [11, 0, 'r'],
        [13, 0, 'm'],
        [13, 1, 'd'],
        [13, 2, 'l'],
        [13, 3, 'u'],
        [13, 0, 'r'],
    ]);
});

test('re-ordered separate cells', () => {
    const inputSet = [13, 11];
    expect(calculateOutlinePath(inputSet)).toStrictEqual([
        [11, 0, 'm'],
        [11, 1, 'd'],
        [11, 2, 'l'],
        [11, 3, 'u'],
        [11, 0, 'r'],
        [13, 0, 'm'],
        [13, 1, 'd'],
        [13, 2, 'l'],
        [13, 3, 'u'],
        [13, 0, 'r'],
    ]);
});

test('adjacent cells', () => {
    const inputSet = [11, 12];
    expect(calculateOutlinePath(inputSet)).toStrictEqual([
        [11, 0, 'm'],
        [12, 0, 'r'],
        [12, 1, 'd'],
        [11, 2, 'l'],
        [11, 3, 'u'],
        [11, 0, 'r'],
    ]);
});

test('more adjacent cells', () => {
    const inputSet = [17, 18, 24, 25, 26, 34, 35];
    expect(calculateOutlinePath(inputSet)).toStrictEqual([
        [17, 0, 'm'],
        [35, 1, 'd'],
        [34, 2, 'l'],
        [25, 2, 'u'],
        [24, 2, 'l'],
        [24, 3, 'u'],
        [26, 3, 'r'],
        [17, 3, 'u'],
        [17, 0, 'r'],
        [18, 0, 'm'],
        [18, 1, 'd'],
        [18, 2, 'l'],
        [18, 3, 'u'],
        [18, 0, 'r'],
    ]);
});

test('block with a land-locked cell', () => {
    const inputSet = [0, 1, 2, 9, 10, 11, 18, 19, 20];
    expect(calculateOutlinePath(inputSet)).toStrictEqual([
        [ 0, 0, 'm'],
        [ 2, 0, 'r'],
        [20, 1, 'd'],
        [18, 2, 'l'],
        [ 0, 3, 'u'],
        [ 0, 0, 'r'],
    ]);
});

test('block with a hole', () => {
    const inputSet = [0, 1, 2, 3, 9, 12, 18, 19, 20, 21];
    expect(calculateOutlinePath(inputSet)).toStrictEqual([
        [ 0, 0, 'm'],
        [ 3, 0, 'r'],
        [21, 1, 'd'],
        [18, 2, 'l'],
        [ 0, 3, 'u'],
        [ 0, 0, 'r'],
        [ 9, 0, 'm'],
        [18, 0, 'd'],
        [21, 3, 'r'],
        [ 3, 2, 'u'],
        [ 0, 1, 'l'],
        [ 9, 0, 'd'],
    ]);
});
