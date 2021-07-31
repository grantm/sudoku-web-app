import calculateGridDimensions from './grid-dimensions';

test('calculateGridDimensions: normal', () => {
    const cellSize = 100;
    const marginSize = 50;
    const fontSize = 72;
    const dim = calculateGridDimensions(cellSize, marginSize, fontSize);

    expect(dim.cellSize).toBe(100);
    expect(dim.marginSize).toBe(50);
    expect(dim.width).toBe(1000);
    expect(dim.height).toBe(1000);

    const cellDims = dim.cell;
    expect(Array.isArray(cellDims)).toBe(true);
    expect(cellDims.length).toBe(81);

    const c11 = cellDims[0];
    expect(c11.index).toBe(0);
    expect(c11.row).toBe(1);
    expect(c11.col).toBe(1);
    expect(c11.box).toBe(1);
    expect(c11.ring).toBe(1);
    expect(c11.location).toBe('R1C1');
    expect(c11.x).toBe(50);
    expect(c11.y).toBe(50);
    expect(c11.textX).toBe(100);
    expect(c11.textY).toBe(125);

    const c76 = cellDims[59];
    expect(c76.index).toBe(59);
    expect(c76.row).toBe(7);
    expect(c76.col).toBe(6);
    expect(c76.box).toBe(8);
    expect(c76.ring).toBe(3);
    expect(c76.location).toBe('R7C6');
    expect(c76.x).toBe(550);
    expect(c76.y).toBe(650);
    expect(c76.textX).toBe(600);
    expect(c76.textY).toBe(725);

    const offsets = dim.outerPencilOffsets;
    expect(offsets).toStrictEqual([
        { key: 'tl', x: 18, y: 30 },
        { key: 'tr', x: 80, y: 30 },
        { key: 'bl', x: 18, y: 90 },
        { key: 'br', x: 80, y: 90 },
        { key: 'tc', x: 49, y: 30 },
        { key: 'bc', x: 49, y: 90 },
        { key: 'cl', x: 18, y: 60 },
        { key: 'cr', x: 80, y: 60 },
        { key: 'cc', x: 49, y: 60 },
    ]);
});

test('calculateGridDimensions: large', () => {
    const cellSize = 200;
    const marginSize = 200;
    const fontSize = 144;
    const dim = calculateGridDimensions(cellSize, marginSize, fontSize);

    expect(dim.cellSize).toBe(200);
    expect(dim.marginSize).toBe(200);
    expect(dim.width).toBe(2200);
    expect(dim.height).toBe(2200);

    const cellDims = dim.cell;
    const c11 = cellDims[0];
    expect(c11.location).toBe('R1C1');
    expect(c11.x).toBe(200);
    expect(c11.y).toBe(200);
    expect(c11.textX).toBe(300);
    expect(c11.textY).toBe(398);

    const offsets = dim.outerPencilOffsets;
    expect(offsets).toStrictEqual([
        { key: 'tl', x:  36, y:  60 },
        { key: 'tr', x: 160, y:  60 },
        { key: 'bl', x:  36, y: 180 },
        { key: 'br', x: 160, y: 180 },
        { key: 'tc', x:  98, y:  60 },
        { key: 'bc', x:  98, y: 180 },
        { key: 'cl', x:  36, y: 120 },
        { key: 'cr', x: 160, y: 120 },
        { key: 'cc', x:  98, y: 120 },
    ]);
});
