import React from 'react';

function CellBackground({cell}) {
    const classes = [ 'cell-bg' ];
    if (cell.get('selected')) {
        classes.push('selected');
    }
    return (
        <rect
            className={classes.join(' ')}
            x={cell.get('x')}
            y={cell.get('y')}
            data-cell-index={cell.get('index')}
            width="100"
            height="100"
        />
    )
}

function CellDigit({cell}) {
    if (cell.get('hasDigit')) {
        return (
            <text
                className="digit"
                x={cell.get('column') * 100}
                y={cell.get('row') * 100 + 25}
                fontSize="65"
                textAnchor="middle"
            >
                {cell.get('digit')}
            </text>
        )
    }
    return null;
}

function CellCover({cell, eventHandler}) {
    return (
        <rect
            x={cell.get('x')}
            y={cell.get('y')}
            data-cell-index={cell.get('index')}
            width="100"
            height="100"
            fill="transparent"
            onMouseDown={eventHandler}
            onMouseOver={eventHandler}
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

export default React.memo( SudokuCell );
