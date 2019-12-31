import React, { useState, useCallback, useEffect, useMemo } from 'react';
import './app.css';

import { newSudokuModel, modelHelpers } from '../../lib/sudoku-model.js';
import useWindowSize from '../../lib/use-window-size.js';

import StatusBar from '../status-bar/status-bar';
import SudokuGrid from '../sudoku-grid/sudoku-grid';

// Keycode definitions (independent of shift/ctrl/etc)
const KEYCODE = {
    digit0: 48,
    digit9: 57,
    numPadDigit0: 96,
    numPadDigit9: 105,
    W: 87,
    A: 65,
    S: 83,
    D: 68,
}

function initialGridFromURL () {
    const params = new URLSearchParams(window.location.search);
    const digits = params.get("s");
    return newSudokuModel(digits);
}

function indexFromCellEvent (e) {
    const index = e.target.dataset.cellIndex;
    if (index === undefined) {
        return;
    }
    return parseInt(index, 10);
}

function cellMouseDownHandler (e, setGrid) {
    const index = indexFromCellEvent(e);
    if (index === undefined) {
        setGrid((grid) => modelHelpers.applyCellOp(grid, 'clearSelection'));
    }
    else {
        if (e.ctrlKey || e.shiftKey) {
            setGrid((grid) => modelHelpers.applyCellOp(grid, 'extendSelection', index));
        }
        else {
            setGrid((grid) => modelHelpers.applyCellOp(grid, 'setSelection', index));
        }
    }
    e.preventDefault();
}

function cellMouseOverHandler (e, setGrid) {
    const index = indexFromCellEvent(e);
    if ((e.buttons & 1) === 1) {
        setGrid((grid) => modelHelpers.applyCellOp(grid, 'extendSelection', index));
        e.preventDefault();
    }
}

function docKeyHandler (e, setGrid, solved) {
    if (solved) {
        return;
    }
    if (e.altKey) {
        return;     // Don't intercept browser hot-keys
    }
    const shiftOrCtrl = e.shiftKey || e.ctrlKey;
    let digit = undefined;
    if (KEYCODE.digit0 <= e.keyCode && e.keyCode <= KEYCODE.digit9) {
        digit = String.fromCharCode(e.keyCode);
    }
    if (KEYCODE.numPadDigit0 <= e.keyCode && e.keyCode <= KEYCODE.numPadDigit9) {
        digit = String.fromCharCode(KEYCODE.digit0 + e.keyCode - KEYCODE.numPadDigit0);
    }
    if (digit !== undefined) {
        if (e.ctrlKey) {
            setGrid((grid) => modelHelpers.updateSelectedCells(grid, 'togglePencilMark', digit, 'inner'));
        }
        else if (e.shiftKey) {
            setGrid((grid) => modelHelpers.updateSelectedCells(grid, 'togglePencilMark', digit, 'outer'));
        }
        else {
            setGrid((grid) => modelHelpers.updateSelectedCells(grid, 'setDigit', digit));
        }
        e.preventDefault();
        return;
    }
    else if (e.key === "Backspace" || e.key === "Delete") {
        setGrid((grid) => modelHelpers.updateSelectedCells(grid, 'clearCell'));
        return;
    }
    else if (e.key === "Escape") {
        setGrid((grid) => modelHelpers.applyCellOp(grid, 'clearSelection'));
        return;
    }
    else if (e.key === "z" && e.ctrlKey) {
        setGrid((grid) => modelHelpers.undoOneAction(grid));
        return;
    }
    else if (e.key === "y" && e.ctrlKey) {
        setGrid((grid) => modelHelpers.redoOneAction(grid));
        return;
    }
    else if (e.key === "ArrowRight" || e.keyCode === KEYCODE.D) {
        setGrid((grid) => modelHelpers.moveFocus(grid, 1, 0, shiftOrCtrl));
        e.preventDefault();
        return;
    }
    else if (e.key === "ArrowLeft" || e.keyCode === KEYCODE.A) {
        setGrid((grid) => modelHelpers.moveFocus(grid, -1, 0, shiftOrCtrl));
        e.preventDefault();
        return;
    }
    else if (e.key === "ArrowUp" || e.keyCode === KEYCODE.W) {
        setGrid((grid) => modelHelpers.moveFocus(grid, 0, -1, shiftOrCtrl));
        e.preventDefault();
        return;
    }
    else if (e.key === "ArrowDown" || e.keyCode === KEYCODE.S) {
        setGrid((grid) => modelHelpers.moveFocus(grid, 0, 1, shiftOrCtrl));
        e.preventDefault();
        return;
    }
    else if (e.key === "Enter") {
        setGrid((grid) => modelHelpers.gameOverCheck(grid));
        return;
    }
    else if (e.key === "Home") {
        setGrid((grid) => modelHelpers.applyCellOp(grid, 'setSelection', modelHelpers.CENTER_CELL));
        return;
    }
    // else { console.log('keydown event:', e); }
}

function getDimensions(winSize) {
    const dim = { ...winSize };
    dim.orientation = dim.width > dim.height ? 'landscape' : 'portrait';
    dim.gridLength = Math.min(
        Math.floor(dim.height * 0.80),
        Math.floor(dim.width * 0.52)
    );
    dim.vkbdWidth = Math.floor(dim.gridLength * 0.65);
    return dim;
}

function App() {
    const [grid, setGrid] = useState(initialGridFromURL);
    const solved = grid.get('solved');
    const mode = grid.get('mode');

    const mouseDownHandler = useCallback(e => cellMouseDownHandler(e, setGrid), []);
    const mouseOverHandler = useCallback(e => cellMouseOverHandler(e, setGrid), []);

    useEffect(
        () => {
            const handler = (e) => docKeyHandler(e, setGrid, solved);
            document.addEventListener('keydown', handler);
            return () => document.removeEventListener('keydown', handler);
        },
        [solved]
    );

    const winSize = useWindowSize();
    const dimensions = useMemo(() => getDimensions(winSize), [winSize])

    const classes = [`sudoku-app mode-${mode} ${dimensions.orientation}`];
    if (solved) {
        classes.push('solved');
    }

    const startButton = mode === 'enter'
        ? <a href={'?s=' + modelHelpers.asDigits(grid)}>Start</a>
        : null;

    return (
        <div className={classes.join(' ')} onMouseDown={mouseDownHandler}>
            <StatusBar
                startTime={grid.get('startTime')}
                endTime={grid.get('endTime')}
                initialDigits={grid.get('initialDigits')}
            />
            <SudokuGrid
                grid={grid}
                mouseDownHandler={mouseDownHandler}
                mouseOverHandler={mouseOverHandler}
            />
            <div className="buttons">
                {startButton}
            </div>
            {
                // <p>
                //     Example puzzle links:
                //     &nbsp;<a href="?s=000001230123008040804007650765000000000000000000000123012300804080400765076500000">Easy</a>
                //     &nbsp;<a href="?s=000007000051802009200450007000906230000000000069305000800034002300209870000500000">Hard</a>
                //     &nbsp;<a href="?s=123456789456789123789123456912345678345608912678912345234567891567891234891234567">Nearly done</a>
                // </p>
            }
        </div>
    );
}

export default App;
