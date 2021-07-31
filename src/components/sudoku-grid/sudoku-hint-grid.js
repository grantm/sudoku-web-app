import React, { useMemo } from 'react';

import calculateGridDimensions from './grid-dimensions';

import GridLines from './grid-lines.js';

import { classList } from '../../lib/string-utils';

import './sudoku-grid.css';


function CellCandidates({dim, pmOffsets, candidates, targetCandidate, isEliminated, fontSize}) {
    const marks = candidates.split('').map(d => {
        const isNewDigit = d === targetCandidate;
        const digitClasses = classList(
            isEliminated[d] && 'elimination',
            isNewDigit && 'new-digit'
        );
        const offset = pmOffsets[d];
        const pmDigit = (
            <text
                key={d}
                className={digitClasses}
                x={dim.x + offset.x}
                y={dim.y + offset.y}
                fontSize={fontSize}
                textAnchor="middle"
            >{d}</text>
        );

        const bgClasses = classList(
            isEliminated[d] && 'elimination-bg',
            isNewDigit && 'new-digit-bg'
        );
        return (isEliminated[d] || isNewDigit)
            ? (
                <g key={`bg-${d}`}>
                    <text
                        className={bgClasses}
                        x={dim.x + offset.x}
                        y={dim.y + offset.y}
                        fontSize={fontSize}
                        textAnchor="middle"
                    >&#9608;</text>
                    {pmDigit}
                </g>
            )
            : pmDigit;
    });
    return <g className="simple-pencil">{marks}</g>;
}


function HintCell({digit, candidates, i, dim, targetCandidate, isHintTarget, isHighlighted, eliminations}) {
    const pmOffsets = dim.simplePencilOffsets;
    const cellDim = dim.cell[i];
    const bgClasses = classList(
        'cell-bg',
        isHintTarget && 'hint-target',
        isHighlighted && 'hint-highlight',
        eliminations && 'hint-eliminations',
    );
    const background = (
        <rect className={bgClasses} x={cellDim.x} y={cellDim.y} width={dim.cellSize} height={dim.cellSize} />
    );
    const textContent = digit === "0"
        ? (
            <CellCandidates
                dim={cellDim}
                pmOffsets={pmOffsets}
                candidates={candidates}
                targetCandidate={isHintTarget ? targetCandidate :  null}
                isEliminated={eliminations || {}}
                fontSize="26"
            />
        )
        : (
            <text
                className="digit"
                x={cellDim.textX}
                y={cellDim.textY}
                fontSize={dim.fontSize}
                textAnchor="middle"
            >
                {digit}
            </text>
        );
    return <g className="hint-cell" id={cellDim.location}>
        {background}
        {textContent}
    </g>;
}


function SudokuHintGrid({digits, candidates, digitIndex, digitValue, highlightCell, eliminationsByCell}) {
    const cellSize = 100;
    const marginSize = 5;
    const fontSize = 84;
    const dim = useMemo(() => calculateGridDimensions(cellSize, marginSize, fontSize), [cellSize, marginSize, fontSize]);
    const digitLayer = digits.map((digit, i) => {
        return (
            <HintCell
                key={i}
                i={i}
                dim={dim}
                digit={digit}
                candidates={candidates[i]}
                targetCandidate={digitValue}
                isHintTarget={i === digitIndex}
                isHighlighted={highlightCell[i]}
                eliminations={eliminationsByCell[i]}
            />
        )
    });
    return (
        <div className="sudoku-grid hint">
            <svg version="1.1"
                viewBox="0 0 910 910"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect className="grid-bg" width="100%" height="100%" />
                {digitLayer}
                <GridLines cellSize={cellSize} marginSize={marginSize} />
            </svg>
        </div>
    );
}

export default SudokuHintGrid;
