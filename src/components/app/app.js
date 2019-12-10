import React, { useState } from 'react';
import './app.css';

import SudokuModel from '../../lib/sudoku-model.js';

import SudokuGrid from '../sudoku-grid/sudoku-grid';

const defaultGrid = SudokuModel.newFromString81(
    '000001230123008040804007650765000000000000000000000123012300804080400765076500000'
);

function cellEventHandler (e, grid, setGrid) {
    const type = e.type;
    const index = parseInt(e.target.dataset.cellIndex, 10);
    console.log(`${type} event on cell[${index}]`, grid.cells[index]);

    if (type === 'mousedown') {
        setGrid(grid.mutateCells((c) => {
            if (c.index === index) {
                return c.mutate({selected: true});
            }
            else if (c.selected) {
                return c.mutate({selected: false});
            }
            return c;
        }));
    }
    else {
        console.log('Unhandled event type:', type);
    }
}

function App() {
    const [grid, setGrid] = useState(defaultGrid);

    const eventProxy = (e) => {
        cellEventHandler(e, grid, setGrid);
    };

    return (
        <div className="app">
            <SudokuGrid grid={grid} eventHandler={eventProxy} />
        </div>
    );
}

export default App;
