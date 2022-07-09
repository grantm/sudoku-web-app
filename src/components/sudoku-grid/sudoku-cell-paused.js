export default function SudokuCellPaused({cell, dim}) {
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
