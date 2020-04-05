import React, { useState, useCallback, useEffect, useMemo } from 'react';
import './app.css';

import { newSudokuModel, modelHelpers } from '../../lib/sudoku-model.js';
import useWindowSize from '../../lib/use-window-size.js';

import StatusBar from '../status-bar/status-bar';
import SudokuGrid from '../sudoku-grid/sudoku-grid';
import VirtualKeyboard from '../virtual-keyboard/virtual-keyboard';
import ModalContainer from '../modal/modal-container';

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
    Y: 89,
    Z: 90,
};

const inputModeFromHotKey = {
    z: 'digit',
    x: 'outer',
    c: 'inner',
    v: 'color',
}

function initialGridFromURL () {
    const params = new URLSearchParams(window.location.search);
    const digits = params.get("s");
    const grid = newSudokuModel({
        initialDigits: digits,
        storeCurrentSnapshot: sn => document.body.dataset.currentSnapshot = sn,
    });
    document.body.dataset.initialDigits = grid.get('initialDigits');
    return grid;
}

function indexFromCellEvent (e) {
    const index = e.target.dataset.cellIndex;
    if (index === undefined) {
        return;
    }
    return parseInt(index, 10);
}

function cellMouseDownHandler (e, setGrid) {
    e.stopPropagation();
    const index = indexFromCellEvent(e);
    if (index === undefined) {
        // Remember, this is a mouseDown handler, not a click handler
        setGrid((grid) => modelHelpers.applySelectionOp(grid, 'clearSelection'));
    }
    else {
        if (e.ctrlKey || e.shiftKey) {
            setGrid((grid) => modelHelpers.applySelectionOp(grid, 'extendSelection', index));
        }
        else {
            setGrid((grid) => modelHelpers.applySelectionOp(grid, 'setSelection', index));
        }
    }
    e.preventDefault();
}

function cellMouseOverHandler (e, setGrid) {
    e.stopPropagation();
    const index = indexFromCellEvent(e);
    if ((e.buttons & 1) === 1) {
        setGrid((grid) => modelHelpers.applySelectionOp(grid, 'extendSelection', index));
        e.preventDefault();
    }
}

function docKeyPressHandler (e, setGrid, solved, inputMode) {
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
        if (e.ctrlKey || inputMode === 'inner') {
            setGrid((grid) => modelHelpers.updateSelectedCells(grid, 'toggleInnerPencilMark', digit));
        }
        else if (e.shiftKey || inputMode === 'outer') {
            setGrid((grid) => modelHelpers.updateSelectedCells(grid, 'toggleOuterPencilMark', digit));
        }
        else if (e.shiftKey || inputMode === 'color') {
            setGrid((grid) => modelHelpers.updateSelectedCells(grid, 'setCellColor', digit));
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
        setGrid((grid) => modelHelpers.applySelectionOp(grid, 'clearSelection'));
        return;
    }
    else if (e.keyCode === KEYCODE.Z && e.ctrlKey) {
        setGrid((grid) => modelHelpers.undoOneAction(grid));
        return;
    }
    else if (e.keyCode === KEYCODE.Y && e.ctrlKey) {
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
        setGrid((grid) => modelHelpers.applySelectionOp(grid, 'setSelection', modelHelpers.CENTER_CELL));
        return;
    }
    else if (e.key === "Control") {
        setGrid((grid) => modelHelpers.setTempInputMode(grid, 'inner'));
        return;
    }
    else if (e.key === "Shift") {
        setGrid((grid) => modelHelpers.setTempInputMode(grid, 'outer'));
        return;
    }
    else if (inputModeFromHotKey[e.key]) {
        setGrid((grid) => modelHelpers.setInputMode(grid, inputModeFromHotKey[e.key]));
        return;
    }
    // else { console.log('keydown event:', e); }
}

function docKeyReleaseHandler(e, setGrid) {
    if (e.key === "Control" || e.key === 'Shift') {
        setGrid((grid) => modelHelpers.clearTempInputMode(grid));
        return;
    }
    // else { console.log('keyup event:', e); }
}

function vkbdClickHandler(e, setGrid, inputMode) {
    e.stopPropagation();
    e.preventDefault();
    const keyValue = e.target.dataset.keyValue;
    if (e.type === 'dblclick') {
        if (keyValue === 'input-mode-color') {
            setGrid((grid) => modelHelpers.confirmClearColorHighlights(grid));
        }
        return;
    }
    if ('0' <= keyValue && keyValue <= '9') {
        if (e.ctrlKey || inputMode === 'inner') {
            setGrid((grid) => modelHelpers.updateSelectedCells(grid, 'toggleInnerPencilMark', keyValue));
        }
        else if (e.shiftKey || inputMode === 'outer') {
            setGrid((grid) => modelHelpers.updateSelectedCells(grid, 'toggleOuterPencilMark', keyValue));
        }
        else if (inputMode === 'color') {
            setGrid((grid) => modelHelpers.updateSelectedCells(grid, 'setCellColor', keyValue));
        }
        else {
            setGrid((grid) => modelHelpers.updateSelectedCells(grid, 'setDigit', keyValue));
        }
        return;
    }
    else if (keyValue === 'delete') {
        setGrid((grid) => modelHelpers.updateSelectedCells(grid, 'clearCell'));
        return;
    }
    else if (keyValue === 'check') {
        setGrid((grid) => modelHelpers.gameOverCheck(grid));
        return;
    }
    else if (keyValue === 'undo') {
        setGrid((grid) => modelHelpers.undoOneAction(grid));
        return;
    }
    else if (keyValue === 'redo') {
        setGrid((grid) => modelHelpers.redoOneAction(grid));
        return;
    }
    else if (keyValue === 'restart') {
        setGrid((grid) => modelHelpers.confirmRestart(grid));
        return;
    }
    else if (keyValue.match(/^input-mode-(digit|inner|outer|color)$/)) {
        const newMode = keyValue.substr(11);
        setGrid((grid) => modelHelpers.setInputMode(grid, newMode));
        return;
    }
    else {
        console.log('keyValue:', keyValue);
    }
}

function dispatchModalAction(action, setGrid) {
    setGrid((grid) => modelHelpers.applyModalAction(grid, action));
}

function dispatchMenuAction(action, setGrid) {
    if (action === 'clear-pencilmarks') {
        setGrid((grid) => modelHelpers.clearPencilmarks(grid));
    }
}

function pauseTimer(setGrid) {
    setGrid((grid) => modelHelpers.pauseTimer(grid));
}

function getDimensions(winSize) {
    const dim = { ...winSize };
    if (dim.width > dim.height) {
        dim.orientation = 'landscape';
        dim.gridLength = Math.min(
            Math.floor(dim.height * 0.80),
            Math.floor(dim.width * 0.52)
        );
        dim.vkbdWidth = Math.floor(dim.gridLength * 0.56);
    }
    else {
        dim.orientation = 'portrait';
        dim.gridLength = Math.min(
            Math.floor(dim.height * 0.54),
            Math.floor(dim.width * 0.95)
        );
        dim.vkbdWidth = Math.floor(dim.gridLength * 0.7);
    }
    return dim;
}

function App() {
    const [grid, setGrid] = useState(initialGridFromURL);
    const pausedAt = grid.get('pausedAt');
    const solved = grid.get('solved');
    const mode = grid.get('mode');
    const inputMode = grid.get('inputMode');
    const tempInputMode = grid.get('tempInputMode');
    const completedDigits = grid.get('completedDigits');

    const mouseDownHandler = useCallback(e => cellMouseDownHandler(e, setGrid), []);
    const mouseOverHandler = useCallback(e => cellMouseOverHandler(e, setGrid), []);
    const vkbdHandler = useCallback(e => vkbdClickHandler(e, setGrid, inputMode), [inputMode]);
    const modalHandler = useCallback(a => dispatchModalAction(a, setGrid), []);
    const menuHandler = useCallback(a => dispatchMenuAction(a, setGrid), []);
    const pauseHandler = useCallback(() => pauseTimer(setGrid), []);

    useEffect(
        () => {
            const pressHandler = (e) => docKeyPressHandler(e, setGrid, solved, tempInputMode || inputMode);
            document.addEventListener('keydown', pressHandler);
            const releaseHandler = (e) => docKeyReleaseHandler(e, setGrid);
            document.addEventListener('keyup', releaseHandler);
            return () => {
                document.removeEventListener('keydown', pressHandler)
                document.removeEventListener('keyup', releaseHandler)
            };
        },
        [solved, tempInputMode, inputMode]
    );

    const winSize = useWindowSize(400);
    const dimensions = useMemo(() => getDimensions(winSize), [winSize])

    const classes = [`sudoku-app mode-${mode} ${dimensions.orientation}`];
    if (solved) {
        classes.push('solved');
    }
    if (pausedAt) {
        classes.push('paused');
    }

    const startButton = mode === 'enter'
        ? (
            <div className="buttons">
                <a href={'?s=' + modelHelpers.asDigits(grid)}>Start</a>
            </div>
        )
        : null;

    const modal = (
        <ModalContainer
            modalState={grid.get('modalState')}
            modalHandler={modalHandler}
        />
    );

    return (
        <div className={classes.join(' ')} onMouseDown={mouseDownHandler}>
            <StatusBar
                startTime={grid.get('startTime')}
                endTime={grid.get('endTime')}
                pausedAt={pausedAt}
                menuHandler={menuHandler}
                pauseHandler={pauseHandler}
                initialDigits={grid.get('initialDigits')}
            />
            <div className="ui-elements">
                <SudokuGrid
                    grid={grid}
                    dimensions={dimensions}
                    isPaused={!!pausedAt}
                    mouseDownHandler={mouseDownHandler}
                    mouseOverHandler={mouseOverHandler}
                />
                <div>
                    <VirtualKeyboard
                        dimensions={dimensions}
                        inputMode={tempInputMode || inputMode}
                        completedDigits={completedDigits}
                        clickHandler={vkbdHandler}
                    />
                    {startButton}
                </div>
            </div>
            {modal}
        </div>
    );
}

export default App;
