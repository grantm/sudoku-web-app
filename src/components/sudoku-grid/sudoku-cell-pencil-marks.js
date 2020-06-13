import React from 'react';

const allDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

function SudokuCellOuterPencilMarks({cell, dim, cellSize, offsets}) {
    const pm = cell.get('outerPencils');
    if (cell.get('digit') !== '0' || pm.size === 0) {
        return null;
    }
    const fontSize = 26 * cellSize / 100;
    let i = 0;
    const marks = allDigits
        .filter(d => pm.includes(d))
        .map((d) => {
            const offset = offsets[i++];
            return (
                <text
                    key={offset.key}
                    x={dim.x + offset.x}
                    y={dim.y + offset.y}
                    fontSize={fontSize}
                    textAnchor="middle"
                >
                    {d}
                </text>
            );
        });
    return <g className="outer-pencil">{marks}</g>;
}

function SudokuCellInnerPencilMarks({cell, dim, cellSize}) {
    const pm = cell.get('innerPencils');
    if (cell.get('digit') !== '0' || pm.size === 0) {
        return null;
    }
    const fontSize = 26 * cellSize / 100;
    const digits = allDigits.filter(d => pm.includes(d)).join('');
    return (
        <text
            className="inner-pencil"
            x={dim.x + 49 * cellSize / 100}
            y={dim.y + 61 * cellSize / 100}
            fontSize={fontSize}
            textAnchor="middle"
        >
            {digits}
        </text>
    );
}

export default function SudokuCellPencilMarks({cell, dim, outerPencilOffsets, cellSize}) {
    return <>
        <SudokuCellOuterPencilMarks cell={cell} dim={dim} cellSize={cellSize} offsets={outerPencilOffsets}/>
        <SudokuCellInnerPencilMarks cell={cell} dim={dim} cellSize={cellSize} />
    </>;
}
