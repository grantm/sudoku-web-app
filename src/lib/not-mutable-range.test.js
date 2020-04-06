import { Range } from './not-mutable';
// import { Range } from 'immutable';

test('Range()', () => {
    const r1 = Range(1, 5);
    expect(r1.toArray().join(',')).toBe('1,2,3,4');
    expect(r1.toList().join(',')).toBe('1,2,3,4');
});
