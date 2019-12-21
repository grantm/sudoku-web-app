import React, { useState, useCallback } from 'react';
import './app.css';

import SudokuModel from '../../lib/sudoku-model.js';

import SudokuGrid from '../sudoku-grid/sudoku-grid';

const defaultGrid = SudokuModel.newFromString81(
    '000001230123008040804007650765000000000000000000000123012300804080400765076500000'
);

function cellEventHandler (e, setGrid) {
    const type = e.type;
    const index = parseInt(e.target.dataset.cellIndex, 10);

    let mutations = [];
    if (type === 'mousedown') {
        if (e.ctrlKey) {
            mutations.push('extendSelection');
        }
        else {
            mutations.push('setSelection');
        }
    }
    else if (type === 'mouseover') {
        if ((e.buttons & 1) === 1) {
            mutations.push('extendSelection');
        }
    }
    else {
        console.log('Unhandled event type:', type);
    }
    if (mutations.length > 0) {
        setGrid((grid) => grid.mutateCells(mutations, index))
    }
}

function App() {
    const [grid, setGrid] = useState(defaultGrid);

    const eventHandler = useCallback(
        (e) => cellEventHandler(e, setGrid),
        [setGrid]
    );

    return (
        <div className="app">
            <SudokuGrid grid={grid} eventHandler={eventHandler} />
        </div>
    );
}

export default App;
