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

function hasPencilledDigit(cell, d) {
    return cell.get('innerPencils').includes(d) || cell.get('outerPencils').includes(d);
}

function CellBackground({cell, matchDigit}) {
    return <>
        <rect
            className={`cell-bg color-code-${cell.get('colorCode')}`}
            x={cell.get('x')}
            y={cell.get('y')}
            width="100"
            height="100"
        />
        <rect
            className="cell-bg-overlay"
            x={cell.get('x')}
            y={cell.get('y')}
            width="100"
            height="100"
        />
    </>
}

function CellDigit({cell}) {
    const digit = cell.get('digit');
    if (digit === '0') {
        return null;
    }
    return (
        <text
            className="digit"
            x={cell.get('col') * 100}
            y={cell.get('row') * 100 + 25}
            fontSize="65"
            textAnchor="middle"
        >
            {digit}
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

function CellCover({cell, highlightConflicts, mouseDownHandler, mouseOverHandler}) {
    const tooltip = (highlightConflicts && cell.get('errorMessage'))
        ? <title>{cell.get('errorMessage')}</title>
        : null;
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
        >{tooltip}</rect>
    )
}


function PausedSudokuCell({cell}) {
    return (
        <g className="cell">
            <text
                className="digit"
                x={cell.get('col') * 100}
                y={cell.get('row') * 100 + 25}
                fontSize="65"
                textAnchor="middle"
            >?</text>
        </g>
    );
}


function SudokuCell({cell, matchDigit, highlightConflicts, isPaused, mouseDownHandler, mouseOverHandler}) {
    if (isPaused) {
        return <PausedSudokuCell cell={cell} />
    }
    const classes = [ 'cell' ];
    if (cell.get('isGiven')) {
        classes.push('given');
    }
    if (cell.get('isSelected')) {
        classes.push('selected');
    }
    if (highlightConflicts && cell.get('errorMessage') !== undefined) {
        classes.push('error');
    }
    const digit = cell.get('digit')
    if (matchDigit !== '0') {
        if (digit === matchDigit || hasPencilledDigit(cell, matchDigit)) {
            classes.push('matched');
        }
    }
    return (
        <g className={classes.join(' ')}
            data-cell-index={cell.get('index')}
            data-row={cell.get('row')}
            data-col={cell.get('col')}
            data-box={cell.get('box')}
            data-ring={cell.get('ring')}
        >
            <CellBackground cell={cell} matchDigit={matchDigit} />
            <CellDigit cell={cell} />
            <CellOuterPencilMarks cell={cell} />
            <CellInnerPencilMarks cell={cell} />
            <CellCover
                cell={cell}
                highlightConflicts={highlightConflicts}
                mouseDownHandler={mouseDownHandler}
                mouseOverHandler={mouseOverHandler}
            />
        </g>
    );
}

export default React.memo( SudokuCell );
