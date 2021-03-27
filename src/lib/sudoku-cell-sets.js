import { Range } from './not-mutable';

const [cellSet, cellProp] = initCellSets();

function initCellSets() {
    const row = {}, col = {}, box = {}, cellProp = [];
    Range(1, 10).forEach((i) => {
        row[i] = [];
        col[i] = [];
        box[i] = [];
    });
    Range(0, 81).forEach((i) => {
        const r = Math.floor(i / 9) + 1;
        const c = (i % 9) + 1;
        const b = Math.floor((r - 1) / 3) * 3 + Math.floor((c - 1) / 3) + 1;
        cellProp[i] = { row: r, col: c, box: b };
        row[r].push(i);
        col[c].push(i);
        box[b].push(i);
    });
    return [ {row, col, box}, cellProp ];
}

export {cellSet, cellProp}
