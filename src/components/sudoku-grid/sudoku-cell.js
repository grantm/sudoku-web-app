import React from 'react';

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

function SudokuCell({cell}) {
    return (
        <g className="cell">
            <CellDigit cell={cell} />
        </g>
    );
}

export default SudokuCell;
