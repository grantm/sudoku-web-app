import React from 'react';

export default function SudokuCellCover({cell, dim, cellSize, mouseDownHandler, mouseOverHandler}) {
    const tooltip = cell.get('errorMessage')
        ? <title>{cell.get('errorMessage')}</title>
        : null;
    return (
        <rect
            x={dim.x}
            y={dim.y}
            data-cell-index={dim.index}
            width={cellSize}
            height={cellSize}
            fill="transparent"
            onMouseDown={mouseDownHandler}
            onMouseOver={mouseOverHandler}
            pointerEvents="fill"
        >{tooltip}</rect>
    )
}
