import React from 'react';

function CellBackground({cell}) {
    const classes = [ 'cell-bg' ];
    if (cell.selected) {
        classes.push('selected');
    }
    return (
        <rect
            className={classes.join(' ')}
            x={cell.x}
            y={cell.y}
            data-cell-index={cell.index}
            width="100"
            height="100"
        />
    )
}

function CellDigit({cell}) {
    if (cell.hasDigit) {
        return (
            <text
                className="digit"
                x={cell.column * 100}
                y={cell.row * 100 + 25}
                fontSize="65"
                textAnchor="middle"
            >
                {cell.digit}
            </text>
        )
    }
    return null;
}

function CellCover({cell, eventHandler}) {
    return (
        <rect
            x={cell.x}
            y={cell.y}
            data-cell-index={cell.index}
            width="100"
            height="100"
            fill="transparent"
            onMouseDown={eventHandler}
            pointerEvents="fill"
        />
    )
}


function SudokuCell({cell, eventHandler}) {
    return (
        <g className="cell">
            <CellBackground cell={cell} />
            <CellDigit cell={cell} />
            <CellCover cell={cell} eventHandler={eventHandler} />
        </g>
    );
}

export default SudokuCell;
