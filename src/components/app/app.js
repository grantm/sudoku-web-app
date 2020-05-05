import React, { useState, useCallback, useEffect, useMemo } from 'react';
import './app.css';

import { newSudokuModel, modelHelpers, SETTINGS } from '../../lib/sudoku-model.js';
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
    F: 70,
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
    const grid = newSudokuModel({
        initialDigits: params.get('s'),
        difficultyLevel: params.get('d'),
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
            setGrid((grid) => modelHelpers.applySelectionOp(grid, 'toggleExtendSelection', index));
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

function cellTouchHandler (e, setGrid) {
    const eventType = e.type;
    const index = e.cellIndex;
    if (eventType === 'cellTouched') {
        setGrid((grid) => modelHelpers.applySelectionOp(grid, 'setSelection', index));
    }
    else if (eventType === 'cellSwipedTo') {
        setGrid((grid) => modelHelpers.applySelectionOp(grid, 'extendSelection', index));
    }
}

function docKeyPressHandler (e, modalActive, setGrid, solved, inputMode) {
    if (solved || modalActive) {
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
    else if (e.keyCode === KEYCODE.F) {
        if (window.document.fullscreen) {
            window.document.exitFullscreen();
        }
        else {
            window.document.body.requestFullscreen();
        }
        return;
    }
    else if (e.key === "F1") {
        setGrid((grid) => modelHelpers.showHelpPage(grid));
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
    else if (e.key === " ") {
        setGrid((grid) => modelHelpers.applySelectionOp(grid, 'toggleExtendSelection', grid.get('focusIndex')));
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

function docKeyReleaseHandler(e, modalActive, setGrid) {
    if (modalActive) {
        return;
    }
    if (e.key === "Control" || e.key === 'Shift') {
        setGrid((grid) => modelHelpers.clearTempInputMode(grid));
        return;
    }
    // else { console.log('keyup event:', e); }
}

function vkbdKeyPressHandler(e, setGrid, inputMode) {
    const keyValue = e.keyValue;
    if (e.type === 'dblclick') {
        if (keyValue === 'input-mode-color') {
            setGrid((grid) => modelHelpers.confirmClearColorHighlights(grid));
        }
        else if ('1' <= keyValue && keyValue <= '9') {
            // dblclick overrides input mode and forces setDigit
            setGrid((grid) => modelHelpers.updateSelectedCells(grid, 'setDigit', keyValue, {replaceUndo: true}));
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
    if (action === 'show-share-modal') {
        setGrid((grid) => modelHelpers.showShareModal(grid));
    }
    else if (action === 'show-settings-modal') {
        setGrid((grid) => modelHelpers.showSettingsModal(grid));
    }
    else if (action === 'clear-pencilmarks') {
        setGrid((grid) => modelHelpers.clearPencilmarks(grid));
    }
    else if (action === 'show-help-page') {
        setGrid((grid) => modelHelpers.showHelpPage(grid));
    }
    else if (action === 'show-about-modal') {
        setGrid((grid) => modelHelpers.showAboutModal(grid));
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
    const settings = grid.get('settings');
    const pausedAt = grid.get('pausedAt');
    const solved = grid.get('solved');
    const mode = grid.get('mode');
    const inputMode = grid.get('tempInputMode') || grid.get('inputMode');
    const completedDigits = grid.get('completedDigits');
    const modalState = grid.get('modalState');
    const modalActive = modalState !== undefined;

    const mouseDownHandler = useCallback(e => cellMouseDownHandler(e, setGrid), []);
    const mouseOverHandler = useCallback(e => cellMouseOverHandler(e, setGrid), []);
    const touchHandler = useCallback(e => cellTouchHandler(e, setGrid), []);
    const vkbdKeyHandler = useCallback(e => vkbdKeyPressHandler(e, setGrid, inputMode), [inputMode]);
    const modalHandler = useCallback(a => dispatchModalAction(a, setGrid), []);
    const menuHandler = useCallback(a => dispatchMenuAction(a, setGrid), []);
    const pauseHandler = useCallback(() => pauseTimer(setGrid), []);

    useEffect(
        () => {
            const pressHandler = (e) => docKeyPressHandler(e, modalActive, setGrid, solved, inputMode);
            document.addEventListener('keydown', pressHandler);
            const releaseHandler = (e) => docKeyReleaseHandler(e, modalActive, setGrid);
            document.addEventListener('keyup', releaseHandler);
            return () => {
                document.removeEventListener('keydown', pressHandler)
                document.removeEventListener('keyup', releaseHandler)
            };
        },
        [solved, inputMode, modalActive]
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
            modalState={modalState}
            modalHandler={modalHandler}
        />
    );

    return (
        <div className={classes.join(' ')} onMouseDown={mouseDownHandler}>
            <StatusBar
                showTimer={settings[SETTINGS.showTimer]}
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
                    touchHandler={touchHandler}
                />
                <div>
                    <VirtualKeyboard
                        dimensions={dimensions}
                        inputMode={inputMode}
                        completedDigits={completedDigits}
                        keyPressHandler={vkbdKeyHandler}
                    />
                    {startButton}
                </div>
            </div>
            {modal}
        </div>
    );
}

export default App;
