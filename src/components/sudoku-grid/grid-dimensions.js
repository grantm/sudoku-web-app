
function calculateGridDimensions(cellSize, marginSize) {
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
            textY: y + (75 * cellSize / 100),
        };
    });
    const dim = {
        cellSize,
        marginSize,
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
            { key: 'lc', x: 18 * cellSize / 100, y: 60 * cellSize / 100 },
            { key: 'rc', x: 80 * cellSize / 100, y: 60 * cellSize / 100 },
            { key: 'cc', x: 49 * cellSize / 100, y: 60 * cellSize / 100 },
        ],
    };
    return dim;
}

export default calculateGridDimensions;
