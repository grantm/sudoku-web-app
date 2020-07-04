import React from 'react';

import './sudoku-grid.css';

import GridLines from './grid-lines.js';


function DifficultyIndicator ({difficulty}) {
    if (difficulty === undefined) {
        return null;
    }
    const barWidth = Math.min(difficulty, 10) * 90;
    return <g>
        <rect className="difficulty-bar" x="50" y="990" width={barWidth} height="15" />
        <rect x="50" y="970" width={barWidth} height="50" fill="transparent">
            <title>Difficulty rating: {difficulty}</title>
        </rect>
    </g>;
}

function SudokuMiniGrid({puzzle, size='120px'}) {
    const cellSize = 100;
    const marginSize = 50;
    const digits = typeof(puzzle) === 'string' ? puzzle : puzzle.digits;
    const difficulty = puzzle.difficulty;
    const givenDigits = digits.split('').map((digit, i) => {
        if (digit === '0') {
            return null;
        }
        const row = Math.floor(i / 9);
        const col = i % 9;
        return (
            <text
                key={i}
                className="digit"
                x={col * cellSize + cellSize}
                y={row * cellSize + 130 * cellSize / 100}
                fontSize={84 * cellSize / 100}
                textAnchor="middle"
            >
                {digit}
            </text>
        )
    });
    return (
        <div className="sudoku-grid mini" style={{width: size}}>
            <svg version="1.1"
                viewBox="0 0 1000 1040"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect className="grid-bg" width="100%" height="100%" />
                {givenDigits}
                <GridLines cellSize={cellSize} marginSize={marginSize} />
                <DifficultyIndicator difficulty={difficulty} />
            </svg>
        </div>
    );
}

export default SudokuMiniGrid;
