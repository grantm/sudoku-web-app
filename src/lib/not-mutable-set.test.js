import { Set } from './not-mutable';
// import { Set } from 'immutable';

test('Set()', () => {
    expect(Set.isSet(null)).toBe(false);
    expect(Set.isSet(undefined)).toBe(false);
    expect(Set.isSet({})).toBe(false);
    expect(Set.isSet([])).toBe(false);

    const s1 = Set();
    expect(typeof s1).toBe('object');
    expect(Set.isSet(s1)).toBe(true);

    expect(Set.isSet({})).toBe(false);

    const s2 = Set([]);
    expect(Set.isSet(s2)).toBe(true);

    expect(Object.is(s1, s2)).toBe(true);

    const s3 = Set(['one', 'two']);
    expect(Set.isSet(s3)).toBe(true);

    expect(Object.is(s1, s3)).toBe(false);

    const s4 = Set(s3);
    expect(Set.isSet(s4)).toBe(true);

    expect(Object.is(s3, s4)).toBe(true);

    const s5 = Set(['one', 'two']);
    expect(Set.isSet(s5)).toBe(true);

    expect(Object.is(s3, s5)).toBe(false);

    expect(Object.is(Set([]), Set([]))).toBe(true);
});

test('Set.size', () => {
    const s1 = Set();
    expect(s1.size).toBe(0);

    const s2 = Set([]);
    expect(s2.size).toBe(0);

    const s3 = Set(['one', 'two', 'three']);
    expect(s3.size).toBe(3);
});

test('Set.includes', () => {
    const s1 = Set();
    expect(s1.includes('two')).toBe(false);

    const s2 = Set(['one']);
    expect(s2.includes('two')).toBe(false);

    const s3 = Set(['one', 'two', 'three']);
    expect(s3.includes('two')).toBe(true);
});

test('Set.add', () => {
    const s1 = Set();
    expect(s1.size).toBe(0);
    expect(s1.includes('one')).toBe(false);

    const s2 = s1.add('one');
    expect(s2.size).toBe(1);
    expect(s2.includes('one')).toBe(true);

    const s3 = s2.add('two')
    expect(s3.size).toBe(2);
    expect(s3.includes('two')).toBe(true);
});

test('Set.delete', () => {
    const s1 = Set(['one', 'two', 'three']);
    expect(s1.size).toBe(3);
    expect(s1.includes('one')).toBe(true);
    expect(s1.includes('two')).toBe(true);
    expect(s1.includes('three')).toBe(true);

    const s2 = s1.delete('two');
    expect(s2.size).toBe(2);
    expect(s2.includes('one')).toBe(true);
    expect(s2.includes('two')).toBe(false);
    expect(s2.includes('three')).toBe(true);

    const s3 = s2.delete('one')
    expect(s3.size).toBe(1);
    expect(s3.includes('one')).toBe(false);
    expect(s3.includes('two')).toBe(false);
    expect(s3.includes('three')).toBe(true);
});

test('Set.toArray', () => {
    const s1 = Set(['one', 'two', 'three', 'four']);
    expect(s1.toArray().sort().join(',')).toBe('four,one,three,two');
    const s2 = Set([]);
    expect(s2.toArray().sort().join(',')).toBe('');
    const s3 = s2.add('9');
    const s4 = s3.add('2');
    const s5 = s4.add('9');
    const s6 = s5.add('7');
    expect(s6.toArray().sort().join(',')).toBe('2,7,9');
});

test('Set.union', () => {
    const s1 = Set(['one', 'three']);
    const s2 = Set(['two', 'four']);
    const s3 = s1.union(s2);
    expect(s1.toArray().sort().join(',')).toBe('one,three');
    expect(s3.toArray().sort().join(',')).toBe('four,one,three,two');

    const s4 = Set.union([s1, s2]);
    expect(s1.toArray().sort().join(',')).toBe('one,three');
    expect(s4.toArray().sort().join(',')).toBe('four,one,three,two');
});
