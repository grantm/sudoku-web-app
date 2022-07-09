
function calculateGridDimensions(cellSize, marginSize, fontSize) {
    const scaledFontSize = fontSize * cellSize / 100;
    // A weird bit of linear algebra that seems to be necessary to vertically centre
    // text of different sizes in the default sans-serif font on my dev platform :-/
    const scaledTextOffset = Math.floor(cellSize * (51 + (fontSize * -8) / 12) / 100);
    const cells = [...Array(81).keys()].map((v, index) => {
        const row = Math.floor(index / 9) + 1;
        const col = (index % 9) + 1;
        const box = Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3) + 1;
        const ring = 5 - Math.max(Math.abs(5 - row), Math.abs(5 - col));
        const x = marginSize + (col - 1) * cellSize;
        const y = marginSize + (row - 1) * cellSize;
        return {
            index,
            row,
            col,
            box,
            ring,
            location: `R${row}C${col}`,
            x,
            y,
            textX: x + (cellSize / 2),
            textY: y + scaledFontSize + scaledTextOffset,
            dragCoverPoints: cellDragCoverPoints(x, y, cellSize),
        };
    });
    const borderInset = 5 * cellSize / 100;
    const dim = {
        cellSize,
        marginSize,
        fontSize: scaledFontSize,
        width: (marginSize * 2) + (cellSize * 9),
        height: (marginSize * 2) + (cellSize * 9),
        cell: cells,
        outerPencilOffsets: [
            { key: 'tl', x: 18 * cellSize / 100, y: 30 * cellSize / 100 },
            { key: 'tr', x: 80 * cellSize / 100, y: 30 * cellSize / 100 },
            { key: 'bl', x: 18 * cellSize / 100, y: 90 * cellSize / 100 },
            { key: 'br', x: 80 * cellSize / 100, y: 90 * cellSize / 100 },
            { key: 'tc', x: 49 * cellSize / 100, y: 30 * cellSize / 100 },
            { key: 'bc', x: 49 * cellSize / 100, y: 90 * cellSize / 100 },
            { key: 'cl', x: 18 * cellSize / 100, y: 60 * cellSize / 100 },
            { key: 'cr', x: 80 * cellSize / 100, y: 60 * cellSize / 100 },
            { key: 'cc', x: 49 * cellSize / 100, y: 60 * cellSize / 100 },
        ],
        simplePencilOffsets: {
            '1': { x: 18 * cellSize / 100, y: 30 * cellSize / 100 },
            '2': { x: 49 * cellSize / 100, y: 30 * cellSize / 100 },
            '3': { x: 80 * cellSize / 100, y: 30 * cellSize / 100 },
            '4': { x: 18 * cellSize / 100, y: 60 * cellSize / 100 },
            '5': { x: 49 * cellSize / 100, y: 60 * cellSize / 100 },
            '6': { x: 80 * cellSize / 100, y: 60 * cellSize / 100 },
            '7': { x: 18 * cellSize / 100, y: 90 * cellSize / 100 },
            '8': { x: 49 * cellSize / 100, y: 90 * cellSize / 100 },
            '9': { x: 80 * cellSize / 100, y: 90 * cellSize / 100 },
        },
        outlinePoints: [
            [ cellSize - borderInset, borderInset ],
            [ cellSize - borderInset, cellSize - borderInset ],
            [ borderInset, cellSize - borderInset ],
            [ borderInset, borderInset ],
        ],
    };
    return dim;
}

function cellDragCoverPoints(x, y, cellSize) {
    const d1 = cellSize * 0.1;
    const d2 = cellSize * 0.3;
    const xa = x + d1;
    const xb = x + d2;
    const xc = x + cellSize - d2;
    const xd = x + cellSize - d1;
    const ya = y + d1;
    const yb = y + d2;
    const yc = y + cellSize - d2;
    const yd = y + cellSize - d1;
    return `${xb},${ya} ${xc},${ya} ${xd},${yb} ${xd},${yc} ${xc},${yd} ${xb},${yd} ${xa},${yc} ${xa},${yb}`;
}
export default calculateGridDimensions;
