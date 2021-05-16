import React, { useState, useCallback, useEffect, useMemo } from 'react';
import './app.css';

import {saveSvgAsPng} from 'save-svg-as-png';

import { newSudokuModel, modelHelpers, SETTINGS } from '../../lib/sudoku-model.js';
import useWindowSize from '../../lib/use-window-size.js';

import StatusBar from '../status-bar/status-bar';
import SudokuGrid from '../sudoku-grid/sudoku-grid';
import VirtualKeyboard from '../virtual-keyboard/virtual-keyboard';
import ModalContainer from '../modal/modal-container';

import { MODAL_TYPE_WELCOME, MODAL_TYPE_HINT } from '../../lib/modal-types';

const FETCH_DELAY = 1000;
const RETRY_INTERVAL = 3000;
const MAX_RETRIES = 10;

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
    P: 80,
    Y: 89,
    Z: 90,
    bracketLeft: 219,
    bracketRight: 221,
};

const digitFromShiftNumKey = {
    "End": "1",
    "ArrowDown": "2",
    "PageDown": "3",
    "ArrowLeft": "4",
    "Unidentified": "5",
    "ArrowRight": "6",
    "Home": "7",
    "ArrowUp": "8",
    "PageUp": "9",
}

const inputModeFromHotKey = {
    z: 'digit',
    x: 'outer',
    c: 'inner',
    v: 'color',
}

function initialGridFromURL () {
    const params = new URLSearchParams(window.location.search);
    let grid = newSudokuModel({
        initialDigits: params.get('s'),
        difficultyLevel: params.get('d'),
        storeCurrentSnapshot: sn => document.body.dataset.currentSnapshot = sn,
    });
    if (window.location.hash === "#features") {
        grid = modelHelpers.showFeaturesModal(grid);
    }
    document.body.dataset.initialDigits = grid.get('initialDigits');
    return grid;
}

function saveScreenshot () {
    // Copy all applicable CSS custom property (variable) values directly into
    // the style property of the SVG element
    const svgGrid = document.getElementById('main-grid').firstChild;
    const elStyle = getComputedStyle(svgGrid); // computed values for current theme
    const cssVars = Array.from(document.styleSheets)
        .map(styleSheet => Array.from(styleSheet.cssRules))
        .flat()
        .filter(cssRule => cssRule.selectorText === ':root')
        .map(cssRule => cssRule.cssText.split('{')[1].split('}')[0].trim().split(';'))
        .flat()
        .filter(text => text !== "")
        .map(text => text.split(':')[0].trim())
        .filter(name => name.startsWith('--'))
        .map(name => {return {name: name, value: elStyle.getPropertyValue(name)}});
    cssVars.forEach(cv => svgGrid.style.setProperty(cv.name, cv.value));
    // Save SVG element to PNG (which will complete asynchronously)
    const options = {
        selectorRemap: (selector) => selector.replace(/[.]sudoku-grid\s+/, '')
    };
    saveSvgAsPng(svgGrid, "sudoku-exchange-screenshot.png", options);
    // Remove the variable values from the SVG element some time later
    setTimeout(
        () => cssVars.forEach(cv => svgGrid.style.setProperty(cv.name, '')),
        1000
    );
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
        if (e.ctrlKey || e.metaKey || e.shiftKey) {
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

function docKeyDownHandler (e, modalActive, setGrid, solved, inputMode) {
    if (solved) {
        return;
    }
    if (modalActive) {
        if (e.key === 'Escape') {
            escapeFromModal(setGrid);
        }
        return;
    }
    if (e.altKey) {
        return;     // Don't intercept browser hot-keys
    }
    const ctrlOrMeta = e.ctrlKey || e.metaKey;
    const shiftOrCtrl = e.shiftKey || ctrlOrMeta;
    let digit = undefined;
    if (KEYCODE.digit0 <= e.keyCode && e.keyCode <= KEYCODE.digit9) {
        digit = String.fromCharCode(e.keyCode);
    }
    else if (KEYCODE.numPadDigit0 <= e.keyCode && e.keyCode <= KEYCODE.numPadDigit9) {
        digit = String.fromCharCode(KEYCODE.digit0 + e.keyCode - KEYCODE.numPadDigit0);
    }
    else if (shiftOrCtrl && e.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD) {
        digit = digitFromShiftNumKey[e.key];
    }
    if (digit !== undefined) {
        setGrid((grid) => {
            let cellOp;
            if ((e.shiftKey && ctrlOrMeta) || inputMode === 'color') {
                cellOp = 'setCellColor';
            }
            else if (ctrlOrMeta || inputMode === 'inner') {
                cellOp = 'toggleInnerPencilMark';
            }
            else if (e.shiftKey || inputMode === 'outer') {
                cellOp = 'toggleOuterPencilMark';
            }
            else {
                cellOp = modelHelpers.defaultDigitOpForSelection(grid);
            }
            return modelHelpers.updateSelectedCells(grid, cellOp, digit);
        });
        e.preventDefault();
        return;
    }
    else if (e.key === "Backspace" || e.key === "Delete") {
        if (e.target === document.body) {
            // We don't want browser to treat this as a back button action
            e.preventDefault();
        }
        setGrid((grid) => modelHelpers.updateSelectedCells(grid, 'clearCell'));
        return;
    }
    else if (e.key === ".") {
        setGrid((grid) => modelHelpers.updateSelectedCells(grid, 'pencilMarksToInner'));
        return;
    }
    else if (e.key === "Escape") {
        setGrid((grid) => modelHelpers.applySelectionOp(grid, 'clearSelection'));
        return;
    }
    else if ((e.keyCode === KEYCODE.Z && ctrlOrMeta) || e.keyCode === KEYCODE.bracketLeft) {
        setGrid((grid) => modelHelpers.undoOneAction(grid));
        return;
    }
    else if ((e.keyCode === KEYCODE.Y && ctrlOrMeta) || e.keyCode === KEYCODE.bracketRight) {
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
        // Don't prevent Cmd-W closing the window (#32)
        if (!(ctrlOrMeta && e.keyCode === KEYCODE.W)) {
            e.preventDefault();
        }
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
    else if (e.keyCode === KEYCODE.P) {
        setGrid((grid) => modelHelpers.toggleShowPencilmarks(grid));
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
    else if (e.key === "Control" || e.key === "Meta") {
        if (e.shiftKey) {
            setGrid((grid) => modelHelpers.setTempInputMode(grid, 'color'));
        }
        else {
            setGrid((grid) => modelHelpers.setTempInputMode(grid, 'inner'));
        }
        return;
    }
    else if (e.key === "Shift") {
        if (ctrlOrMeta) {
            setGrid((grid) => modelHelpers.setTempInputMode(grid, 'color'));
        }
        else {
            setGrid((grid) => modelHelpers.setTempInputMode(grid, 'outer'));
        }
        return;
    }
    else if (inputModeFromHotKey[e.key]) {
        setGrid((grid) => modelHelpers.setInputMode(grid, inputModeFromHotKey[e.key]));
        return;
    }
    // else { console.log('keydown event:', e); }
}

function escapeFromModal(setGrid) {
    setGrid((grid) => {
        const modalState = grid.get('modalState');
        if (modalState && modalState.escapeAction) {
            grid = modelHelpers.applyModalAction(grid, modalState.escapeAction);
        }
        return grid;
    });
}

function docKeyUpHandler(e, modalActive, setGrid) {
    if (modalActive) {
        return;
    }
    if (e.key === "Control" || e.key === "Meta") {
        if (e.shiftKey) {
            setGrid((grid) => modelHelpers.setTempInputMode(grid, 'outer'));
        }
        else {
            setGrid((grid) => modelHelpers.clearTempInputMode(grid));
        }
        return;
    }
    else if (e.key === 'Shift') {
        if (e.ctrlKey || e.metaKey) {
            setGrid((grid) => modelHelpers.setTempInputMode(grid, 'inner'));
        }
        else {
            setGrid((grid) => modelHelpers.clearTempInputMode(grid));
        }
        return;
    }
    // else { console.log('keyup event:', e); }
}

function clearTempInputMode(setGrid) {
    setGrid((grid) => modelHelpers.clearTempInputMode(grid));
}

const inputEventHandler = (function() {
    const DOUBLE_CLICK_TIME = 650
    let lastEvent = {};

    return (e, setGrid, inputMode) => {
        const {type, value} = e;
        const now = Date.now();
        if (e.wantDoubleClick && type === lastEvent.type && value === lastEvent.value) {
            if ((now - lastEvent.eventTime) < DOUBLE_CLICK_TIME) {
                e.isDoubleClick = true;
            }
        }
        lastEvent = {type, value, eventTime: now};
        if (e.type === 'vkbdKeyPress') {
            return vkbdKeyPressHandler(e, setGrid, inputMode);
        }
        else if (e.type === 'cellTouched' || e.type === 'cellSwipedTo') {
            return cellTouchHandler(e, setGrid);
        }
    }
})();

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

function vkbdKeyPressHandler(e, setGrid, inputMode) {
    const keyValue = e.keyValue;
    if (e.isDoubleClick) {
        if (keyValue === 'input-mode-color') {
            setGrid((grid) => modelHelpers.confirmClearColorHighlights(grid));
        }
        else if (keyValue === 'input-mode-inner') {
            setGrid((grid) => modelHelpers.updateSelectedCells(grid, 'pencilMarksToInner'));
        }
        else if ('1' <= keyValue && keyValue <= '9') {
            if (inputMode === 'inner' || inputMode === 'outer') {
                // dblclick overrides input mode and forces setDigit
                setGrid((grid) => modelHelpers.updateSelectedCells(grid, 'setDigit', keyValue, {replaceUndo: true}));
            }
        }
        return;
    }
    if ('0' <= keyValue && keyValue <= '9') {
        setGrid((grid) => {
            const selectedCellCount = grid.get("cells").count((c) => c.get("isSelected"));
            if (e.ctrlKey || e.metaKey || inputMode === 'inner') {
                return modelHelpers.updateSelectedCells(grid, 'toggleInnerPencilMark', keyValue);
            }
            else if (inputMode === 'color') {
                return modelHelpers.updateSelectedCells(grid, 'setCellColor', keyValue);
            }
            else if (e.shiftKey || inputMode === 'outer' || selectedCellCount > 1) {
                return modelHelpers.updateSelectedCells(grid, 'toggleOuterPencilMark', keyValue);
            }
            else {
                return modelHelpers.updateSelectedCells(grid, 'setDigit', keyValue);
            }
        });
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
    if (action.action === 'paste-initial-digits') {
        // Suppress onpageunload handling when user clicks 'Start' after pasting a puzzle
        delete document.body.dataset.currentSnapshot;
    }
    setGrid((grid) => modelHelpers.applyModalAction(grid, action));
}

function dispatchMenuAction(action, setGrid) {
    if (action === 'show-share-modal') {
        setGrid((grid) => modelHelpers.showShareModal(grid));
    }
    else if (action === 'show-paste-modal') {
        setGrid((grid) => modelHelpers.showPasteModal(grid));
    }
    else if (action === 'show-settings-modal') {
        setGrid((grid) => modelHelpers.showSettingsModal(grid));
    }
    else if (action === 'show-solver-modal') {
        setGrid((grid) => modelHelpers.showSolverModal(grid));
    }
    else if (action === 'toggle-show-pencilmarks') {
        setGrid((grid) => modelHelpers.toggleShowPencilmarks(grid));
    }
    else if (action === 'clear-pencilmarks') {
        setGrid((grid) => modelHelpers.clearPencilmarks(grid));
    }
    else if (action === 'calculate-candidates') {
        setGrid((grid) => modelHelpers.showCalculatedCandidates(grid));
    }
    else if (action === 'show-help-page') {
        setGrid((grid) => modelHelpers.showHelpPage(grid));
    }
    else if (action === 'show-about-modal') {
        setGrid((grid) => modelHelpers.showAboutModal(grid));
    }
    else if (action === 'save-screenshot') {
        saveScreenshot();
    }
    else if (action === 'show-hint-modal') {
        setGrid((grid) => modelHelpers.showHintModal(grid));
    }
    else {
        console.log(`Unrecognised menu action: '${action}'`);
    }
}

function pauseTimer(setGrid) {
    setGrid((grid) => modelHelpers.pauseTimer(grid));
}

function preStartCheck() {
    // Suppress onpageunload handling when user clicks 'Start' after entering a puzzle
    delete document.body.dataset.currentSnapshot;
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
    if (modalState && modalState.fetchRequired) {
        if (modalState.modalType === MODAL_TYPE_WELCOME) {
            modelHelpers.fetchRecentlyShared(grid, setGrid, FETCH_DELAY);
        }
        else if (modalState.modalType === MODAL_TYPE_HINT) {
            modelHelpers.fetchExplainPlan(grid, setGrid, RETRY_INTERVAL, MAX_RETRIES);
        }
    }
    const modalActive = modalState !== undefined;
    const showHints = modelHelpers.featureIsEnabled(grid, 'hints') && mode === 'solve';

    const mouseDownHandler = useCallback(e => cellMouseDownHandler(e, setGrid), []);
    const mouseOverHandler = useCallback(e => cellMouseOverHandler(e, setGrid), []);
    const inputHandler = useCallback(e => inputEventHandler(e, setGrid, inputMode), [inputMode]);
    const modalHandler = useCallback(a => dispatchModalAction(a, setGrid), []);
    const menuHandler = useCallback(a => dispatchMenuAction(a, setGrid), []);
    const pauseHandler = useCallback(() => pauseTimer(setGrid), []);

    useEffect(
        () => {
            const pressHandler = (e) => docKeyDownHandler(e, modalActive, setGrid, solved, inputMode);
            document.addEventListener('keydown', pressHandler);
            const releaseHandler = (e) => docKeyUpHandler(e, modalActive, setGrid);
            document.addEventListener('keyup', releaseHandler);
            return () => {
                document.removeEventListener('keydown', pressHandler)
                document.removeEventListener('keyup', releaseHandler)
            };
        },
        [solved, inputMode, modalActive]
    );

    useEffect(
        () => {
            const blurHandler = (e) => clearTempInputMode(setGrid);
            window.addEventListener('blur', blurHandler);
            return () => window.removeEventListener('blur', blurHandler);
        },
        [setGrid] // This effect will essentially never be re-run
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
                <a className="btn" href={'?s=' + modelHelpers.asDigits(grid)} onClick={preStartCheck}>Start</a>
            </div>
        )
        : null;

    const modal = (
        <ModalContainer
            modalState={modalState}
            modalHandler={modalHandler}
            menuHandler={menuHandler}
        />
    );

    return (
        <div className={classes.join(' ')} onMouseDown={mouseDownHandler}>
            <StatusBar
                showTimer={settings[SETTINGS.showTimer]}
                startTime={grid.get('startTime')}
                endTime={grid.get('endTime')}
                pausedAt={pausedAt}
                showHints={showHints}
                showPencilmarks={grid.get('showPencilmarks')}
                menuHandler={menuHandler}
                pauseHandler={pauseHandler}
                initialDigits={grid.get('initialDigits')}
            />
            <div className="ui-elements">
                <SudokuGrid
                    grid={grid}
                    gridId="main-grid"
                    dimensions={dimensions}
                    isPaused={!!pausedAt}
                    mouseDownHandler={mouseDownHandler}
                    mouseOverHandler={mouseOverHandler}
                    inputHandler={inputHandler}
                />
                <div>
                    <VirtualKeyboard
                        dimensions={dimensions}
                        inputMode={inputMode}
                        flipNumericKeys={settings[SETTINGS.flipNumericKeys]}
                        completedDigits={completedDigits}
                        inputHandler={inputHandler}
                        simplePencilMarking={settings[SETTINGS.simplePencilMarking]}
                    />
                    {startButton}
                </div>
            </div>
            {modal}
        </div>
    );
}

export default App;
