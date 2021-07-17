import { List } from './not-mutable';
// import { List } from 'immutable';

test('List()', () => {
    expect(List.isList(null)).toBe(false);
    expect(List.isList(undefined)).toBe(false);
    expect(List.isList({})).toBe(false);
    expect(List.isList([])).toBe(false);

    const l1 = List();
    expect(typeof l1).toBe('object');
    expect(List.isList(l1)).toBe(true);

    expect(List.isList([])).toBe(false);

    const l2 = List([]);
    expect(List.isList(l2)).toBe(true);

    expect(Object.is(l1, l2)).toBe(true);

    const l3 = List(['one']);
    expect(List.isList(l3)).toBe(true);

    expect(Object.is(l1, l3)).toBe(false);

    const l4 = List(l3);
    expect(List.isList(l4)).toBe(true);

    expect(Object.is(l3, l4)).toBe(true);

    const l5 = List(['one']);
    expect(List.isList(l5)).toBe(true);

    expect(Object.is(l3, l5)).toBe(false);

    expect(Object.is(List([]), List([]))).toBe(true);
});

test('List.size', () => {
    const l1 = List();
    expect(l1.size).toBe(0);

    const l2 = List(['one', 'two', 'three', 'four']);
    expect(l2.size).toBe(4);

    const l3 = List(['one', 'two', 'three'], ['four', 'five']);
    expect(l3.size).toBe(3);

    const l4 = List('eleven', 'twelve');
    expect(l4.size).toBe(6);

    const l5 = List([l1, l1]);
    expect(l5.size).toBe(2);
});

test('List.get', () => {
    const l1 = List();
    expect(l1.get(0)).toBe(undefined);
    expect(l1.get(11)).toBe(undefined);

    const l2 = List(['zero', 'one', 'two', 'three', 'four']);
    expect(l2.size).toBe(5);
    expect(l2.get(0)).toBe('zero');
    expect(l2.get(1)).toBe('one');
    expect(l2.get(-1)).toBe('four');
    expect(l2.get(-5)).toBe('zero');
    expect(l2.get(5)).toBe(undefined);
    expect(l2.get(-6)).toBe(undefined);
    expect(l2.get(5, 'missing')).toBe('missing');
    expect(l2.size).toBe(5);
});

test('List.set', () => {
    const l1 = List();
    expect(l1.size).toBe(0);
    expect(l1.get(0)).toBe(undefined);

    const l2 = l1.set(0, 'zero');
    expect(l1.size).toBe(0);
    expect(l2.size).toBe(1);
    expect(l2.get(0)).toBe('zero');

    const l3 = l2.set(1, 'one');
    expect(l2.size).toBe(1);
    expect(l3.size).toBe(2);
    expect(l3.join(',')).toBe('zero,one');

    const l4 = l3.set(0, 'zilch');
    expect(l3.get(0)).toBe('zero');
    expect(l4.join(',')).toBe('zilch,one');
});

test('List.clear', () => {
    const l1 = List(['one', 'two', 'three']);
    expect(l1.size).toBe(3);
    const l2 = l1.clear();
    expect(l2.size).toBe(0);
    expect(l1.size).toBe(3);
});

test('List.last', () => {
    const l1 = List(['zero', 'one', 'two', 'three', 'four']);
    expect(l1.size).toBe(5);
    expect(l1.last()).toBe('four');

    const l2 = List();
    expect(l2.size).toBe(0);
    expect(l2.last()).toBe(undefined);
    expect(l2.last('missing')).toBe('missing');
    expect(l2.get(0)).toBe(undefined);
    expect(l2.size).toBe(0);
});

test('List.push', () => {
    const l1 = List();
    expect(l1.size).toBe(0);

    const l2 = l1.push('one');
    expect(Object.is(l1, l2)).toBe(false);
    expect(l2.size).toBe(1);
    expect(l1.size).toBe(0);
    expect(l2.join(',')).toBe('one');

    const l3 = l2.push('two');
    expect(Object.is(l2, l3)).toBe(false);
    expect(l3.size).toBe(2);
    expect(l2.size).toBe(1);
    expect(l3.join(',')).toBe('one,two');

    const l4 = l3.push('three', 'four', 'five');
    expect(l4.size).toBe(5);
    expect(l4.join(',')).toBe('one,two,three,four,five');

    const l5 = l2.push(['TWO', 'THREE']);
    expect(l5.size).toBe(2);
    expect(l5.join(',')).toBe('one,TWO,THREE');

    const l6 = l3.push(['THREE', 'FOUR', 'FIVE'], 'six');
    expect(l6.size).toBe(4);
    expect(l6.join(',')).toBe('one,two,THREE,FOUR,FIVE,six');
});

test('List.pop', () => {
    const l1 = List(['one', 'two', 'three']);
    expect(l1.size).toBe(3);
    expect(l1.last()).toBe('three');
    const l2 = l1.pop();
    expect(l1.size).toBe(3);
    expect(l2.size).toBe(2);
    expect(l2.last()).toBe('two');
    const l3 = l2.pop();
    expect(l3.size).toBe(1);
    expect(l3.last()).toBe('one');
    const l4 = l3.pop();
    expect(l4.size).toBe(0);
    expect(l4.last()).toBe(undefined);
    const l5 = l4.pop();
    expect(Object.is(l4, l5)).toBe(true);
});

test('List.join', () => {
    const l1 = List();
    expect(l1.join(',')).toBe('');

    const l2 = List(['one', 'two', 'three']);
    expect(l2.join(',')).toBe('one,two,three');
});

test('List.map', () => {
    const l1 = List(['one', 'two', 'three']);
    expect(l1.size).toBe(3);

    const l2 = l1.map(x => x.toUpperCase());
    expect(l2.size).toBe(3);
    expect(l2.join(',')).toBe('ONE,TWO,THREE');
});

test('List.filter', () => {
    const l1 = List(['one', 'two', 'three', 'four', 'five']);
    expect(l1.size).toBe(5);

    const l2 = l1.filter(x => x.match(/e/));
    expect(l2.size).toBe(3);
    expect(l2.join(',')).toBe('one,three,five');

    const l3 = l1.map(x => x.toUpperCase()).filter(x => x.match(/E/));
    expect(l3.size).toBe(3);
    expect(l3.join(',')).toBe('ONE,THREE,FIVE');
});

test('List.reduce', () => {
    const l1 = List(['one', 'two', 'three']);
    expect(l1.size).toBe(3);

    const chars = l1.reduce((a, v) => {return a + v.length}, 0);
    expect(chars).toBe(11);

    const l2 = List([12, 7, 22, 15]);
    const sum = l2.reduce((a, v) => a + v);
    expect(sum).toBe(56);
});

test('List.count', () => {
    const l1 = List(['one', 'two', 'three', 'four', 'five']);
    expect(l1.count()).toBe(5);
    expect(l1.count(x => x.match(/e/))).toBe(3);
});

test('List.forEach', () => {
    const l1 = List(['one', 'two', 'three', 'four']);

    let s = '';
    let r = l1.forEach((v, i) => s = s + `[${i}]: '${v}'\n`);
    expect(r).toBe(4);
    expect(s).toBe("[0]: 'one'\n[1]: 'two'\n[2]: 'three'\n[3]: 'four'\n");

    s = '';
    r = l1.forEach((v, i) => {
        if (v === 'three') {
            return false;   // false mean stop iterating
        }
        s = s + `[${i}]: '${v}'\n`;
        return true;
    });
    expect(r).toBe(3);
    expect(s).toBe("[0]: 'one'\n[1]: 'two'\n");
});

test('List.toList', () => {
    const l1 = List([]);
    const l2 = l1.toList();
    expect(Object.is(l1, l2)).toBe(true);
});

test('List.toArray', () => {
    const l1 = List([]);
    const a1 = l1.toArray();
    expect(List.isList(l1)).toBe(true);
    expect(List.isList(a1)).toBe(false);
    expect(Array.isArray(l1)).toBe(false);
    expect(Array.isArray(a1)).toBe(true);
    expect(a1.length).toBe(0);
    expect(a1).toStrictEqual([]);

    const l2 = List(['one', 2, 'III']);
    expect(l2.toArray()).toStrictEqual(['one', 2, 'III']);

    const l3 = List(['one', 'two']);
    const l4 = List(['three', 'four', 'five']);
    const l5 = List([l3, l4]);
    const a2 = l5.toArray();
    expect(Array.isArray(a2)).toBe(true);
    expect(a2.length).toBe(2);
    expect(Array.isArray(a2[0])).toBe(false);
    expect(Array.isArray(a2[1])).toBe(false);
    expect(List.isList(a2[0])).toBe(true);
    expect(List.isList(a2[1])).toBe(true);
});

test('List.find', () => {
    const l1 = List([1, 1, 2, 3, 5, 8, 13, 21]);
    expect(l1.size).toBe(8);

    // find no match
    expect(l1.find(n => {
        return false;
    })).toBe(undefined);

    // find first, don't examine elements after match
    expect(l1.find(n => {
        if (n > 8) {
            throw new Error("List.find should not be examining elements after first match");
        }
        return n > 7;
    })).toBe(8);
});
