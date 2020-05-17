import React from 'react';

import './sudoku-grid.css';

import GridLines from './grid-lines.js';


function SudokuMiniGrid({digits, size='120px'}) {
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
                x={col * 100 + 100}
                y={row * 100 + 125}
                fontSize="88"
                textAnchor="middle"
            >
                {digit}
            </text>
        )
    });
    return (
        <div className="sudoku-grid mini" style={{width: size}}>
            <svg version="1.1"
                viewBox="0 0 1000 1000"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect className="grid-bg" width="100%" height="100%" />
                {givenDigits}
                <GridLines />
            </svg>
        </div>
    );
}

export default SudokuMiniGrid;
