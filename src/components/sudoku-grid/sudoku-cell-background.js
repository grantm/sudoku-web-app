function cellHasPencilledDigit(cell, d, simplePencilMarking) {
    return cell.get('innerPencils').includes(d) || (!simplePencilMarking && cell.get('outerPencils').includes(d));
}

export default function SudokuCellBackground({cell, dim, cellSize, matchDigit, showPencilmarks, simplePencilMarking}) {
    const bgColorCode = showPencilmarks ? cell.get('colorCode') : '1';
    const bgClasses = [ 'cell-bg' ];
    if (cell.get('isGiven')) {
        bgClasses.push('given');
    }
    if (cell.get('isSelected')) {
        bgClasses.push('selected');
    }
    if (cell.get('errorMessage') !== undefined) {
        bgClasses.push('error');
    }
    const digit = cell.get('digit')
    if (matchDigit !== '0') {
        if (digit === matchDigit || (showPencilmarks && cellHasPencilledDigit(cell, matchDigit, simplePencilMarking))) {
            bgClasses.push('matched');
        }
    }
    return (
        <g className={bgClasses.join(' ')}
            data-cell-index={dim.index}
            data-row={dim.row}
            data-col={dim.col}
            data-box={dim.box}
            data-ring={dim.ring}
        >
            <rect
                className={`color-code-${bgColorCode}`}
                x={dim.x}
                y={dim.y}
                width={cellSize}
                height={cellSize}
            />
            <rect
                className="cell-select-match-overlay"
                x={dim.x}
                y={dim.y}
                width={cellSize}
                height={cellSize}
            />
        </g>
    );
}
