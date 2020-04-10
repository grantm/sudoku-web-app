import { Range } from './not-mutable';
// import { Range } from 'immutable';

test('Range()', () => {
    const r1 = Range(1, 5);
    expect(r1.toArray().join(',')).toBe('1,2,3,4');
    expect(r1.toList().join(',')).toBe('1,2,3,4');
});

test('Range.forEach', () => {
    const r1 = Range(0, 5);
    const a1 = [];
    r1.forEach(i => a1[i] = `item ${i}`);
    expect(a1.join(',')).toBe('item 0,item 1,item 2,item 3,item 4');
});
