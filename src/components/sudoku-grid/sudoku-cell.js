import React from 'react';

const allDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

function hasPencilledDigit(cell, d) {
    return cell.get('innerPencils').includes(d) || cell.get('outerPencils').includes(d);
}

function CellBackground({cell, dim, cellSize, showPencilmarks}) {
    const colorCode = showPencilmarks ? cell.get('colorCode') : '1';
    return <>
        <rect
            className={`cell-bg color-code-${colorCode}`}
            x={dim.x}
            y={dim.y}
            width={cellSize}
            height={cellSize}
        />
        <rect
            className="cell-bg-overlay"
            x={dim.x}
            y={dim.y}
            width={cellSize}
            height={cellSize}
        />
    </>
}

function CellDigit({cell, dim, cellSize}) {
    const digit = cell.get('digit');
    const fontSize = 72 * cellSize / 100;
    if (digit === '0') {
        return null;
    }
    return (
        <text
            className="digit"
            x={dim.textX}
            y={dim.textY}
            fontSize={fontSize}
            textAnchor="middle"
        >
            {digit}
        </text>
    );
}

function CellOuterPencilMarks({cell, dim, cellSize, offsets}) {
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

function CellInnerPencilMarks({cell, dim, cellSize}) {
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

function CellCover({cell, dim, cellSize, mouseDownHandler, mouseOverHandler}) {
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


function PausedSudokuCell({cell, dim}) {
    return (
        <g className="cell">
            <text
                className="digit"
                x={dim.textX}
                y={dim.textY}
                fontSize="65"
                textAnchor="middle"
            >?</text>
        </g>
    );
}


function SudokuCell({cell, dim, cellSize, outerPencilOffsets, showPencilmarks, matchDigit, isPaused, mouseDownHandler, mouseOverHandler}) {
    if (isPaused) {
        return <PausedSudokuCell cell={cell} dim={dim} />
    }
    const classes = [ 'cell' ];
    if (cell.get('isGiven')) {
        classes.push('given');
    }
    if (cell.get('isSelected')) {
        classes.push('selected');
    }
    if (cell.get('errorMessage') !== undefined) {
        classes.push('error');
    }
    const digit = cell.get('digit')
    if (matchDigit !== '0') {
        if (digit === matchDigit || (showPencilmarks && hasPencilledDigit(cell, matchDigit))) {
            classes.push('matched');
        }
    }
    const outerPencilmarks = showPencilmarks
        ? <CellOuterPencilMarks cell={cell} dim={dim} cellSize={cellSize} offsets={outerPencilOffsets} />
        : null;
    const innerPencilmarks = showPencilmarks ? <CellInnerPencilMarks cell={cell} dim={dim} cellSize={cellSize} /> : null;
    return (
        <g className={classes.join(' ')}
            data-cell-index={dim.index}
            data-row={dim.row}
            data-col={dim.col}
            data-box={dim.box}
            data-ring={dim.ring}
        >
            <CellBackground cell={cell} dim={dim} cellSize={cellSize} showPencilmarks={showPencilmarks} />
            <CellDigit cell={cell} dim={dim} cellSize={cellSize} />
            {outerPencilmarks}
            {innerPencilmarks}
            <CellCover
                cell={cell}
                dim={dim}
                cellSize={cellSize}
                mouseDownHandler={mouseDownHandler}
                mouseOverHandler={mouseOverHandler}
            />
        </g>
    );
}

export default React.memo( SudokuCell );
