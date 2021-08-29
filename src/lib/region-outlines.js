/*
 * Helper routines to calculate a path around the perimeter of a set of cells.
 *
 * Each cell has four points that the path might pass through:
 *
 *        +-----+
 *        |3   0|
 *        |     |
 *        |2   1|
 *        +-----+
 *
 * This routine examines the supplied cells in numerical order of indexes and
 * checks if it's possible to move from the current point in the current cell to
 * the corresponding point in a neighbouring cell in the set in the following order:
 *
 *   From point 0 right to point 3 of neighbour otherwise to point 1 of self
 *   From point 1 down to point 0 of neighbour otherwise to point 2 of self
 *   From point 2 left to point 1 of neighbour otherwise to point 3 of self
 *   From point 3 up to point 2 of neighbour otherwise to point 0 of self
 *
 * When examining each cell, special handling is needed for cells that:
 *  - are in the set, but do not for part of the boundary since they are
 *    surrounded by other cells in the set; or
 *  - are in the set and form part of the boundary on one side but also need
 *    to be part of a boundary on the other side due to the presence of a hole
 *    in the set.
 *
 * The path is optimised to skip intermediate steps in the same direction.
 */

const CELL = 0;
const POINT = 1;
const OP = 2;

const opFromNextPoint = ['r', 'd', 'l', 'u'];

export function calculateOutlinePath(inputSet) {
    inputSet = [...inputSet].sort((a,b) => a - b);
    const path = [];
    const isInSet = {};
    inputSet.forEach(i => isInSet[i] = true);
    const seen = {};
    inputSet.forEach(i => {
        const col = i % 9 + 1;
        if (isInSet[i]) {
            if (seen[i]) {
                if (col < 9 && !seen[i][0] && !isInSet[i+1]) {
                    _extendPathOutline(path, i, 0, isInSet, seen);
                }
            }
            else {
                if (col > 1 && seen[i-1]) {
                    seen[i] = { skipped: "landlocked"};
                }
                else {
                    _extendPathOutline(path, i, 0, isInSet, seen);
                }
            }
        }
    });
    return path;
}

function _extendPathOutline(path, i, p, isInSet, seen) {
    let curr = [i, p, 'm'];
    let next;
    while (true) {
        if (path.length > 0 && path[path.length - 1][OP] === curr[OP]) {
            path.pop();
        }
        path.push(curr);
        seen[curr[CELL]] = seen[curr[CELL]] || {};
        if (seen[curr[CELL]][curr[POINT]]) {
            if (seen[curr[CELL]][curr[POINT]] !== 'm') {
                throw new Error(`Visiting point ${curr[CELL]}.${curr[POINT]}, expected 'm' got '${seen[curr[CELL]][curr[POINT]]}'`);
            }
            return;
        }
        seen[curr[CELL]][curr[POINT]] = curr[OP];
        next = _findNeighbouringCell(curr, isInSet)
            || _findNextPointInCell(curr);
        curr = next;
    }
}

function _findNeighbouringCell(curr, isInSet) {
    const row = Math.floor(curr[CELL] / 9) + 1;
    const col = curr[CELL] % 9 + 1;
    if (curr[POINT] === 0 && col < 9 && isInSet[curr[CELL] + 1]) {
        return [ curr[CELL] + 1, 3, 'r' ];
    }
    else if (curr[POINT] === 1 && row < 9 && isInSet[curr[CELL] + 9]) {
        return [ curr[CELL] + 9, 0, 'd' ];
    }
    else if (curr[POINT] === 2 && col > 1 && isInSet[curr[CELL] - 1]) {
        return [ curr[CELL] - 1, 1, 'l' ];
    }
    else if (curr[POINT] === 3 && row > 1 && isInSet[curr[CELL] - 9]) {
        return [ curr[CELL] - 9, 2, 'u' ];
    }
    return;
}

function _findNextPointInCell(curr) {
    const nextPoint = (curr[POINT] + 1) % 4;
    const op = opFromNextPoint[nextPoint];
    return [
        curr[CELL],
        nextPoint,
        op,
    ]
}
