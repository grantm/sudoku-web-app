// This library implements a tiny subset of the functionality of immutable.js in
// a mostly-compatible way.  The code doesn't do anything clever and is really
// just a thin wrapper around native arrays and objects, but in a way that makes
// it hard to accidentally mutate the wrapped objects.
//
// This is not intended to imply there's anything wrong with immutable.js.
// Writing this library was mostly just a fun learning exercise.

// ==========================================================================
// List()
// ==========================================================================

const _nm_list = Symbol();

class NMList {
    constructor() {
        this[_nm_list] = [];
    }

    get size() {
        return this[_nm_list].length;
    }

    _new_list(args) {
        const l = new NMList();
        l[_nm_list] = args;
        return l;
    }

    clear() {
        return emptyList;
    }

    get(i, ...args) {
        const def = args.length > 0 ? args[0] : undefined;
        const l = this[_nm_list];
        if (i > (l.length - 1)) {
            return def;
        }
        else if ((i < 0) && ((i * -1) > l.length)) {
            return def;
        }
        return i < 0 ? l[l.length + i] : l[i];
    }

    set(i, v) {
        const old = this[_nm_list];
        const l = [ ...old ];
        l[i] = v;
        return this._new_list(l);
    }

    last(...args) {
        const def = args.length > 0 ? args[0] : undefined;
        const l = this[_nm_list];
        return l.length === 0 ? def : l[l.length - 1];
    }

    push(...args) {
        if (args.length === 0) {
            return this;
        }
        const old = this[_nm_list];
        return this._new_list([ ...old, ...args ])
    }

    pop() {
        const old = this[_nm_list];
        if (old.length <= 1) {
            return emptyList;
        }
        const l = [ ...old ];
        l.pop();
        return this._new_list(l);
    }

    join(sep) {
        return this[_nm_list].join(sep);
    }

    map (f) {
        return this._new_list(this[_nm_list].map(f));
    }

    filter (f) {
        return this._new_list(this[_nm_list].filter(f));
    }

    reduce (...args) {
        return this[_nm_list].reduce(...args);
    }

    count (f) {
        if (typeof f === 'function') {
            return this.reduce((acc, val) => {return f(val) ? acc + 1 : acc}, 0);
        }
        else {
            return this[_nm_list].length;
        }
    }

    forEach (f) {
        const l = this[_nm_list];
        for (let i = 0; i < l.length; i++) {
            if (f(l[i], i) === false) {
                return i + 1;
            }
        }
        return l.length;
    }

    find(f) {
        const l = this[_nm_list];
        return l.find(f);
    }

    toList () {
        return this;
    }

    toArray () {
        const l = this[_nm_list];
        return [...l];
    }
}

const emptyList = new NMList();

function List(...args) {
    if (args.length === 0) {
        return emptyList;
    }
    else if (args.length === 1 && List.isList(args[0])) {
        return args[0];
    }
    else if (Array.isArray(args[0])) {
        return args[0].length === 0 ? emptyList : emptyList._new_list(args[0]);
    }
    else if (typeof args[0] === 'string') {
        return emptyList._new_list(args[0].split(''));
    }
    return emptyList._new_list([args[0]]);
}

List.isList = o => !!(o && o.constructor === NMList);


// ==========================================================================
// Map()
// ==========================================================================

const _nm_map = Symbol();

class NMMap {
    constructor() {
        this[_nm_map] = {};
    }

    get size() {
        return Object.keys(this[_nm_map]).length;
    }

    _new_map(args) {
        const m = new NMMap();
        m[_nm_map] = args;
        return m;
    }

    clear() {
        return emptyMap;
    }

    get(k, ...args) {
        const def = args.length > 0 ? args[0] : undefined;
        const m = this[_nm_map];
        if (!m.hasOwnProperty(k)) {
            return def;
        }
        return m[k];
    }

    set(k, v) {
        const old = this[_nm_map];
        const m = { ...old, [k]: v };
        return this._new_map(m);
    }

    update(k, ...args) {
        const def = args.length > 1 ? args.shift() : undefined;
        const f = args.shift();
        const old = this[_nm_map];
        const prev = old.hasOwnProperty(k) ? old[k] : def;
        const m = { ...old, [k]: f(prev) };
        return this._new_map(m);
    }

    delete(k) {
        const old = this[_nm_map];
        const m = { ...old };
        delete m[k];
        return this._new_map(m);
    }

    merge(...args) {
        const old = this[_nm_map];
        const m = { ...old };
        while (args.length > 0) {
            const m2 = args.pop();
            for (const k in m2) {
                if (m2.hasOwnProperty(k)) {
                    m[k] = m2[k];
                }
            }
        }
        return this._new_map(m);
    }

    toObject() {
        const map = this[_nm_map];
        return { ...map };
    }
}

const emptyMap = new NMMap();

function Map(...args) {
    if (args.length === 0) {
        return emptyMap;
    }
    else if (args.length === 1 && Map.isMap(args[0])) {
        return args[0];
    }
    else if (Object.keys(args[0]).length === 0) {
        return emptyMap;
    }
    // else if (Array.isArray(args[0])) {
    //     return emptyList._new_list(args[0]);
    // }
    // else if (typeof args[0] === 'string') {
    //     return emptyList._new_list(args[0].split(''));
    // }
    return emptyMap._new_map(args[0]);
}

Map.isMap = o => !!(o && o.constructor === NMMap);


// ==========================================================================
// Set()
// ==========================================================================

const _nm_set = Symbol();

class NMSet {
    constructor() {
        this[_nm_set] = {};
    }

    get size() {
        return Object.keys(this[_nm_set]).length;
    }

    _new_set(arg) {
        const s = new NMSet();
        let o = {};
        if (Array.isArray(arg)) {
            for (let i = 0; i < arg.length; i++) {
                o[ arg[i] ] = true
            }
        }
        else {
            o = arg;
        }
        s[_nm_set] = o;
        return s;
    }

    add(v) {
        const old = this[_nm_set];
        const s = { ...old, [v]: true };
        return this._new_set(s);
    }

    delete(v) {
        const old = this[_nm_set];
        const s = { ...old };
        delete s[v];
        return this._new_set(s);
    }

    includes(v) {
        return this[_nm_set].hasOwnProperty(v);
    }

    union(s2) {
        const old = this[_nm_set];
        const s = { ...old };
        s2.toArray().forEach((v) => {
            s[v] = true;
        });

        return this._new_set(s);
    }

    toArray() {
        const s = this[_nm_set];
        return Object.keys(s).sort();
    }
}

const emptySet = new NMSet();

function Set(...args) {
    if (args.length === 0) {
        return emptySet;
    }
    else if (args.length === 1 && Set.isSet(args[0])) {
        return args[0];
    }
    else if (Array.isArray(args[0]) && args[0].length === 0) {
        return emptySet;
    }
    return emptySet._new_set(args[0]);
}

Set.isSet = o => !!(o && o.constructor === NMSet);

Set.union = a => {
    a = Array.isArray(a) ? a : a.toArray();
    let s = emptySet;
    a.forEach((t) => {
        s = s.union(t)
    });
    return s;
}

// ==========================================================================
// Range()
// ==========================================================================

const _nm_range = Symbol();

class NMRange {
    constructor() {
        this[_nm_range] = {};
    }

    _new_range(args) {
        const r = new NMRange();
        r[_nm_range] = args;
        return r;
    }

    toArray() {
        const r = this[_nm_range];
        const a = [];
        for (let i = r.start; i < r.end; i = i + r.step) {
            a.push(i);
        }
        return a;
    }

    toList() {
        return List(this.toArray());
    }

    forEach(f) {
        const r = this[_nm_range];
        for (let i = r.start; i < r.end; i = i + r.step) {
            f(i);
        }
    }
}

const emptyRange = new NMRange();

function Range(start, end, step=1) {
    return emptyRange._new_range({start, end, step});
}

Range.isRange = o => !!(o && o.constructor === NMRange);


export { List, Map, Set, Range };
