import React from 'react';

import './sudoku-grid.css';

import SudokuCell from './sudoku-cell';
import GridLines from './grid-lines.js';

function SudokuGrid({cells}) {
    const cellContents = cells.map((c,i) => <SudokuCell key={c.location} cell={c} />);
    return (
        <div className="sudoku-grid">
            <svg version="1.1"
                baseProfile="full"
                viewBox="0 0 1000 1000"
                xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#eeeeee" />
                <rect x="50" y="50" width="900" height="900" fill="#ffffff" />
                {cellContents}
                <GridLines />
            </svg>
        </div>
    );
}

export default SudokuGrid;
