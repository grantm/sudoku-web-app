import { Map } from './not-mutable';
// import { Map } from 'immutable';

test('Map()', () => {
    expect(Map.isMap(null)).toBe(false);
    expect(Map.isMap(undefined)).toBe(false);
    expect(Map.isMap({})).toBe(false);
    expect(Map.isMap([])).toBe(false);

    const m1 = Map();
    expect(typeof m1).toBe('object');
    expect(Map.isMap(m1)).toBe(true);

    expect(Map.isMap({})).toBe(false);

    const m2 = Map({});
    expect(Map.isMap(m2)).toBe(true);

    expect(Object.is(m1, m2)).toBe(true);

    const m3 = Map({ one: 'I', two: 'II' });
    expect(Map.isMap(m3)).toBe(true);

    expect(Object.is(m1, m3)).toBe(false);

    const m4 = Map(m3);
    expect(Map.isMap(m4)).toBe(true);

    expect(Object.is(m3, m4)).toBe(true);

    const m5 = Map({ one: 'I', two: 'II' });
    expect(Map.isMap(m5)).toBe(true);

    expect(Object.is(m3, m5)).toBe(false);

    expect(Object.is(Map({}), Map({}))).toBe(true);
});

test('Map.size', () => {
    const m1 = Map();
    expect(m1.size).toBe(0);
    const m2 = Map({});
    expect(m2.size).toBe(0);
    const m3 = Map({ one: 'I' });
    expect(m3.size).toBe(1);
    const m4 = Map({ one: 'I', two: 'II', three: 'III', four: 'IV' });
    expect(m4.size).toBe(4);
});

test('Map.get()', () => {
    const m1 = Map({ one: 'I', two: 'II' });
    expect(m1.get('one')).toBe('I');
    expect(m1.get('two')).toBe('II');
    expect(m1.get('three')).toBe(undefined);
    expect(m1.get('three', 'III')).toBe('III');
});

test('Map.clear()', () => {
    const m1 = Map({ one: 'I', two: 'II' });
    expect(m1.size).toBe(2);
    const m2 = m1.clear();
    expect(m2.size).toBe(0);
    expect(m1.size).toBe(2);
});

test('Map.delete()', () => {
    const m1 = Map({ one: 'I', two: 'II', three: 'III' });
    expect(m1.size).toBe(3);
    const m2 = m1.delete('two');
    expect(m2.size).toBe(2);
    expect(m1.get('two')).toBe('II');
    expect(m2.get('one')).toBe('I');
    expect(m2.get('three')).toBe('III');
    expect(m2.get('two')).toBe(undefined);
});

test('Map.set()', () => {
    const m1 = Map({ one: 'I', two: 'II', three: 'III' });
    expect(m1.size).toBe(3);
    const m2 = m1.set('four', 'IV');
    expect(m2.size).toBe(4);
    expect(m1.get('four')).toBe(undefined);
    expect(m2.get('one')).toBe('I');
    expect(m2.get('four')).toBe('IV');
    const m3 = m2.set('two', 'ii');
    expect(m3.size).toBe(4);
    expect(m2.get('two')).toBe('II');
    expect(m3.get('two')).toBe('ii');
});

test('Map.set()', () => {
    const inc = v => v + 1;
    const m1 = Map({ one: 0, two: 11 });
    const m2 = m1.update('one', inc);
    const m3 = m2.update('one', inc);
    const m4 = m3.update('two', inc);
    const m5 = m4.update('three', 100, inc);
    expect(m1.get('one')).toBe(0);
    expect(m5.get('one')).toBe(2);
    expect(m5.get('two')).toBe(12);
    expect(m5.get('three')).toBe(101);
});

test('Map.merge()', () => {
    const m1 = Map({ two: 'II', five: 'V'});
    expect(m1.size).toBe(2);
    const m2 = m1.merge({ one: 1, three: 3, five: 5}, { four: 'IV' });
    expect(m2.size).toBe(5);
    expect(m2.get('one')).toBe(1);
    expect(m2.get('two')).toBe('II');
    expect(m2.get('three')).toBe(3);
    expect(m2.get('four')).toBe('IV');
    expect(m2.get('five')).toBe(5);
});

test('Map.toObject()', () => {
    const m1 = Map({ one: 1, two: 2 });
    expect(m1.toObject()).toStrictEqual({ one: 1, two: 2});
    const m2 = m1.set('three', 3);
    expect(m2.toObject()).toStrictEqual({ one: 1, two: 2, three: 3});
});
