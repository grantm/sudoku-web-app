import React from 'react';

export default function SudokuCellCover({cell, dim, cellSize, mouseDownHandler, mouseOverHandler}) {
    const tooltip = cell.get('errorMessage')
        ? <title>{cell.get('errorMessage')}</title>
        : null;
    return (
        <rect
            className="cell-cover"
            x={dim.x - 0.5}
            y={dim.y - 0.5}
            fill="transparent"
            data-cell-index={dim.index}
            width={cellSize + 1}
            height={cellSize + 1}
            onMouseDown={mouseDownHandler}
            onMouseOver={mouseOverHandler}
            pointerEvents="fill"
        >{tooltip}</rect>
    )
}
