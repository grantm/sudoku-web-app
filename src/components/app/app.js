import React, { useState, useCallback, useEffect } from 'react';
import './app.css';

import { newSudokuModel, modelHelpers } from '../../lib/sudoku-model.js';

import SudokuGrid from '../sudoku-grid/sudoku-grid';

const defaultGrid = newSudokuModel(
    '000001230123008040804007650765000000000000000000000123012300804080400765076500000'
);

function indexFromCellEvent (e) {
    return parseInt(e.target.dataset.cellIndex, 10);
}

function cellMouseDownHandler (e, setGrid) {
    const index = indexFromCellEvent(e);
    if (e.ctrlKey) {
        setGrid((grid) => modelHelpers.applyCellOp(grid, 'extendSelection', index));
    }
    else {
        setGrid((grid) => modelHelpers.applyCellOp(grid, 'setSelection', index));
    }
}

function cellMouseOverHandler (e, setGrid) {
    const index = indexFromCellEvent(e);
    if ((e.buttons & 1) === 1) {
        setGrid((grid) => modelHelpers.applyCellOp(grid, 'extendSelection', index));
    }
}

function docKeyHandler (e, setGrid) {
    if (48 <= e.keyCode && e.keyCode <= 57) {  // independent of shift/ctrl/etc
        const key = String.fromCharCode(e.keyCode);
        return setGrid((grid) => modelHelpers.updateSelectedCells(grid, 'setDigit', key));
    }
    else if (e.key === "Backspace") {
        return setGrid((grid) => modelHelpers.applyCellOp(grid, 'clearDigits'));
    }
    else if (e.key === "Escape") {
        return setGrid((grid) => modelHelpers.applyCellOp(grid, 'clearSelection'));
    }
    else if (e.key === "z" && e.ctrlKey) {
        return setGrid((grid) => modelHelpers.undoOneAction(grid));
    }
    else if (e.key === "y" && e.ctrlKey) {
        return setGrid((grid) => modelHelpers.redoOneAction(grid));
    }
    else {
        console.log('keydown event:', e);
    }
}

function App() {
    const [grid, setGrid] = useState(defaultGrid);

    const mouseDownHandler = useCallback(
        (e) => cellMouseDownHandler(e, setGrid),
        [setGrid]
    );

    const mouseOverHandler = useCallback(
        (e) => cellMouseOverHandler(e, setGrid),
        [setGrid]
    );

    useEffect(
        () => {
            const handler = (e) => docKeyHandler(e, setGrid);
            document.addEventListener('keydown', handler);
            return () => document.removeEventListener('keydown', handler);
        },
        [setGrid]
    );

    return (
        <div className="app">
            <SudokuGrid
                grid={grid}
                mouseDownHandler={mouseDownHandler}
                mouseOverHandler={mouseOverHandler}
            />
        </div>
    );
}

export default App;
