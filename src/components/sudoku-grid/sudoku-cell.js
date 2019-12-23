import React from 'react';

const allDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const outerPencilOffsets = [
    { key: 'tl', x: 18, y: 31 },
    { key: 'tr', x: 80, y: 31 },
    { key: 'bl', x: 18, y: 91 },
    { key: 'br', x: 80, y: 91 },
    { key: 'tc', x: 49, y: 31 },
    { key: 'bc', x: 49, y: 91 },
    { key: 'lc', x: 18, y: 61 },
    { key: 'rc', x: 80, y: 61 },
    { key: 'cc', x: 49, y: 61 },
];

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
    if (cell.get('digit') === '0') {
        return null;
    }
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
    );
}

function CellOuterPencilMarks({cell}) {
    const pm = cell.get('outerPencils');
    if (cell.get('digit') !== '0' || pm.size === 0) {
        return null;
    }
    let i = 0;
    const marks = allDigits
        .filter(d => pm.includes(d))
        .map((d) => {
            const pos = outerPencilOffsets[i++];
            return (
                <text
                    key={pos.key}
                    x={cell.get('x') + pos.x}
                    y={cell.get('y') + pos.y}
                    fontSize="26"
                    textAnchor="middle"
                >
                    {d}
                </text>
            );
        });
    return <g className="outer-pencil">{marks}</g>;
}

function CellInnerPencilMarks({cell}) {
    const pm = cell.get('innerPencils');
    if (cell.get('digit') !== '0' || pm.size === 0) {
        return null;
    }
    const digits = allDigits.filter(d => pm.includes(d)).join('');
    return (
        <text
            className="inner-pencil"
            x={cell.get('x') + 49}
            y={cell.get('y') + 61}
            fontSize="26"
            textAnchor="middle"
        >
            {digits}
        </text>
    );
}

function CellCover({cell, mouseDownHandler, mouseOverHandler}) {
    return (
        <rect
            x={cell.get('x')}
            y={cell.get('y')}
            data-cell-index={cell.get('index')}
            width="100"
            height="100"
            fill="transparent"
            onMouseDown={mouseDownHandler}
            onMouseOver={mouseOverHandler}
            pointerEvents="fill"
        />
    )
}


function SudokuCell({cell, mouseDownHandler, mouseOverHandler}) {
    const classes = [ 'cell' ];
    if (cell.get('isGiven')) {
        classes.push('given');
    }
    return (
        <g className={classes.join(' ')}>
            <CellBackground cell={cell} />
            <CellDigit cell={cell} />
            <CellOuterPencilMarks cell={cell} />
            <CellInnerPencilMarks cell={cell} />
            <CellCover
                cell={cell}
                mouseDownHandler={mouseDownHandler}
                mouseOverHandler={mouseOverHandler}
            />
        </g>
    );
}

export default React.memo( SudokuCell );
