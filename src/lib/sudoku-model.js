// import { List, Map, Range, Set } from 'immutable';
import { List, Map, Range, Set } from './not-mutable';
import { SudokuHinter } from './sudoku-hinter';
import { cellSet, cellProp } from './sudoku-cell-sets';
import SudokuExplainer from './sudoku-explainer';

import {
    MODAL_TYPE_WELCOME,
    MODAL_TYPE_INVALID_INITIAL_DIGITS,
    MODAL_TYPE_PASTE,
    MODAL_TYPE_SHARE,
    MODAL_TYPE_SETTINGS,
    MODAL_TYPE_CHECK_RESULT,
    MODAL_TYPE_PAUSED,
    MODAL_TYPE_CONFIRM_RESTART,
    MODAL_TYPE_CONFIRM_CLEAR_COLOR_HIGHLIGHTS,
    MODAL_TYPE_SOLVER,
    MODAL_TYPE_HINT,
    MODAL_TYPE_HELP,
    MODAL_TYPE_ABOUT,
    MODAL_TYPE_QR_CODE,
    MODAL_TYPE_FEATURES,
} from './modal-types';

export const SETTINGS = {
    darkMode: "dark-mode",
    showTimer: "show-timer",
    simplePencilMarking: 'simple-pencil-marking',
    highlightMatches: "highlight-matches",
    highlightConflicts: "highlight-conflicts",
    autocleanPencilmarks: "autoclean-pencilmarks",
    flipNumericKeys: "flip-numeric-keys",
    playVictoryAnimation: "play-victory-animation",
    passProgressToSolver: "pass-progress-to-solver",
    showRatings: "show-ratings",
};

export const AVAILABLE_FEATURE_FLAGS = [
    {
        name: "hints",
        description: "Add a hint button. Note: the hint 'server' is still being debugged.",
        issueNumber: 34,
    }
];

const difficultyLevels = [
    { value: "1", name: "Easy" },
    { value: "2", name: "Medium" },
    { value: "3", name: "Hard" },
    { value: "4", name: "Diabolical" },
];

const emptySet = Set();
const charCodeOne = '1'.charCodeAt(0);

function indexFromRC (rc) {
    return (rc.charCodeAt(0) - charCodeOne) * 9 + (rc.charCodeAt(1) - charCodeOne);
}


function newCell(index, digit) {
    digit = digit || '0';
    if (!digit.match(/^[0-9]$/)) {
        throw new RangeError(
            `Invalid Cell() value '${digit}', expected '0'..'9'`
        );
    }
    const row = Math.floor(index / 9) + 1;
    const col = (index % 9) + 1;
    const box = Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3) + 1;
    return Map({
        // Properties set at creation and then never changed
        index,
        row,
        col,
        box,
        isGiven: digit !== '0',
        // Properties that might change and get serialised for undo/redo
        digit,
        outerPencils: emptySet,
        innerPencils: emptySet,
        colorCode: '1',
        // Cache for serialised version of above properties
        snapshot: '',
        // Transient properties that might change but are not preserved by undo
        isSelected: false,
        errorMessage: undefined,
    });
}

export function newSudokuModel({initialDigits, difficultyLevel, storeCurrentSnapshot, entryPoint, skipCheck}) {
    initialDigits = (initialDigits || '').replace(/[_.-]/g, '0').replace(/\D/g, '');
    const initialError = skipCheck ? undefined : modelHelpers.initialErrorCheck(initialDigits);
    const mode = initialError ? 'enter' : 'solve';
    const settings = modelHelpers.loadSettings();
    const featureFlags = modelHelpers.loadFeatureFlags();
    const grid = Map({
        solved: false,
        mode,
        settings,
        featureFlags,
        difficultyLevel: (difficultyLevel || '').replace(/[^1-4]/g, ''),
        inputMode: 'digit',
        tempInputMode: undefined,
        startTime: mode === 'solve' ? Date.now() : undefined,
        endTime: undefined,
        pausedAt: undefined,
        undoList: List(),
        redoList: List(),
        currentSnapshot: '',
        storeCurrentSnapshot: storeCurrentSnapshot,
        cells: List(),
        showPencilmarks: true,
        hasErrors: false,
        focusIndex: null,
        completedDigits: {},
        matchDigit: '0',
        modalState: undefined,
    });
    return initialError
        ? modelHelpers.setInitialDigits(grid, initialDigits, initialError, entryPoint)
        : modelHelpers.setGivenDigits(grid, initialDigits, {skipCheck});
};

function actionsBlocked(grid) {
    return grid.get('solved') || (grid.get('modalState') !== undefined);
}

export const modelHelpers = {
    CENTER_CELL: 40,
    DEFAULT_SETTINGS: {
        [SETTINGS.darkMode]: false,
        [SETTINGS.showTimer]: true,
        [SETTINGS.simplePencilMarking]: false,
        [SETTINGS.highlightMatches]: true,
        [SETTINGS.highlightConflicts]: true,
        [SETTINGS.autocleanPencilmarks]: true,
        [SETTINGS.flipNumericKeys]: false,
        [SETTINGS.playVictoryAnimation]: true,
        [SETTINGS.passProgressToSolver]: false,
        [SETTINGS.showRatings]: false,
    },

    loadSettings: () => {
        const defaults = modelHelpers.DEFAULT_SETTINGS;
        let savedSettings = {};
        try {
            const savedSettingsJSON = window.localStorage.getItem('settings') || '{}';
            savedSettings = JSON.parse(savedSettingsJSON);
        }
        catch {
            // ignore errors
        };
        const settings = {...defaults, ...savedSettings};
        modelHelpers.syncSettingsToDom(settings);
        return settings;
    },

    saveSettings: (grid, newSettings) => {
        const newSettingsJSON = JSON.stringify(newSettings);
        window.localStorage.setItem('settings', newSettingsJSON);
        modelHelpers.syncSettingsToDom(newSettings);
        return grid.set('settings', newSettings);
    },

    loadFeatureFlags: () => {
        let savedFeatureFlags = {};
        try {
            const savedFeatureFlagsJSON = window.localStorage.getItem('featureFlags') || '{}';
            savedFeatureFlags = JSON.parse(savedFeatureFlagsJSON);
        }
        catch {
            // ignore errors
        };
        const flags = {};
        AVAILABLE_FEATURE_FLAGS.forEach((f) => {
            if (savedFeatureFlags[f.name]) {
                flags[f.name] = true;
            }
        });
        return flags;
    },

    saveFeatureFlags: (grid, newFeatureFlags) => {
        const newFeatureFlagsJSON = JSON.stringify(newFeatureFlags);
        window.localStorage.setItem("featureFlags", newFeatureFlagsJSON);
        return grid.set("featureFlags", newFeatureFlags);
    },

    featureIsEnabled: (grid, featureName) => {
        return (grid.get("featureFlags") || {})[featureName] === true;
    },

    hinter: (grid) => {
        const cells = grid.get('cells').toArray();
        return new SudokuHinter(cells);
    },

    loadCachedRecentlyShared: () => {
        let cachedPuzzles;
        try {
            const cachedPuzzlesJSON = window.localStorage.getItem('recentlyShared') || '{}';
            cachedPuzzles = JSON.parse(cachedPuzzlesJSON);
        }
        catch {
            // ignore errors
        };
        return cachedPuzzles;
    },

    saveCachedRecentlyShared: (recentData) => {
        const recentDataJSON = JSON.stringify({
            data: recentData,
            time: Date.now(),
        });
        window.localStorage.setItem('recentlyShared', recentDataJSON);
    },

    syncSettingsToDom: (settings) => {
        if (settings[SETTINGS.darkMode]) {
            window.document.body.classList.add('dark');
        }
        else {
            window.document.body.classList.remove('dark');
        }
        if (settings[SETTINGS.playVictoryAnimation]) {
            window.document.body.classList.add('animate');
        }
        else {
            window.document.body.classList.remove('animate');
        }
    },

    getSetting: (grid, settingName) => {
        const allSettings = grid.get('settings');
        return allSettings[settingName];
    },

    allDifficultyLevels: () => {
        return difficultyLevels;
    },

    difficultyLevelName: (value) => {
        const level = difficultyLevels.find(lvl => lvl.value === value) || {};
        return level.name;
    },

    initialErrorCheck: (initialDigits) => {
        if (initialDigits === undefined || initialDigits === null || initialDigits === '') {
            return { noStartingDigits: true };
        }
        if (!initialDigits.match(/^[0-9]{81}$/)) {
            return { insufficientDigits: true };
        }
        const result = modelHelpers.checkDigits(initialDigits);
        if (result.hasErrors) {
            return { hasErrors: true };
        }
        return;
    },

    setGivenDigits: (grid, initialDigits, options) => {
        const cells = Range(0, 81).toList().map(i => newCell(i, initialDigits[i]));
        grid = modelHelpers.checkCompletedDigits(grid.merge({
            initialDigits,
            cells,
        }));
        if (options.skipCheck) {
            return grid;
        }
        const digits = initialDigits.split('');
        const result = modelHelpers.findSolutions(digits);
        if (result.uniqueSolution) {
            grid = grid.set('finalDigits', result.finalDigits);
        }
        else {
            grid = grid.set('modalState', {
                modalType: MODAL_TYPE_CHECK_RESULT,
                icon: 'warning',
                errorMessage: result.error,
                escapeAction: 'close',
            });
        }
        return grid;
    },

    setInitialDigits: (grid, initialDigits, initialError, entryPoint) => {
        const cells = initialError.noStartingDigits
            ? Range(0, 81).toList().map(i => newCell(i, '0'))
            : Range(0, 81).toList().map(i => newCell(i, '0').set('digit', initialDigits[i] || '0'));
        let modalState = undefined;
        if (initialError.noStartingDigits) {
            modalState = {
                modalType: MODAL_TYPE_WELCOME,
                loading: true,
                fetchRequired: true,
                showRatings: modelHelpers.getSetting(grid, SETTINGS.showRatings),
            };
        }
        else if (initialError.insufficientDigits) {
            modalState = {
                modalType: MODAL_TYPE_INVALID_INITIAL_DIGITS,
                insufficientDigits: true,
                initialDigits: initialDigits,
            };
        }
        else if (initialError.hasErrors) {
            modalState = {
                modalType: MODAL_TYPE_INVALID_INITIAL_DIGITS,
                hasErrors: true,
                initialDigits: initialDigits,
            };
        }
        return modelHelpers.checkCompletedDigits(grid.merge({
            initialDigits,
            modalState,
            cells,
        }));
    },

    fetchRecentlyShared: (grid, setGrid, fetchDelay) => {
        const modalState = grid.get('modalState');
        delete modalState.fetchRequired;    // Naughty, but we don't want a re-render
        const setRecentlySharedData = data => {
            setGrid(grid => {
                const modalState = grid.get('modalState') || {};
                if (modalState.modalType === MODAL_TYPE_WELCOME) {
                    return grid.set('modalState', {
                        modalType: MODAL_TYPE_WELCOME,
                        recentlyShared: data,
                        showRatings: modelHelpers.getSetting(grid, SETTINGS.showRatings),
                    });
                }
                else {
                    return grid;    // user has moved on, silently discard response
                }
            });
        };
        const fetchHandler = () => {
            fetch('/recently-shared')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`${response.status} ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    modelHelpers.saveCachedRecentlyShared(data);
                    setRecentlySharedData(data);
                })
                .catch(error => setGrid(grid => {
                    const modalState = grid.get('modalState') || {};
                    if (modalState.modalType === MODAL_TYPE_WELCOME) {
                        return grid.set('modalState', {
                            modalType: MODAL_TYPE_WELCOME,
                            loadingFailed: true,
                            errorMessage: error.toString(),
                        });
                    }
                    else {
                        return grid;    // user has moved on, silently discard response
                    }
                }));
        };
        const cachedPuzzles = modelHelpers.loadCachedRecentlyShared();
        if (cachedPuzzles && cachedPuzzles.data) {
            const cacheAge = (Date.now() - cachedPuzzles.time) / 1000;
            if (cacheAge < 3600) {
                setRecentlySharedData(cachedPuzzles.data);
                if (cacheAge < 60) {
                    return;
                }
                fetchDelay = 1;
            }
        }
        setTimeout(fetchHandler, fetchDelay);
    },

    fetchExplainPlan: (grid, setGrid, retryInterval, maxRetries) => {
        const modalState = grid.get('modalState');
        delete modalState.fetchRequired;    // Naughty, but we don't want a re-render
        const explainURL = '/explain/' + grid.get('initialDigits');
        let retryCount = 0;
        const setNewModalState = ({analysis, errorMessage}) => {
            setGrid(grid => {
                const modalState = grid.get('modalState');
                if (!modalState || modalState.modalType !== MODAL_TYPE_HINT) {
                    return grid;  // user has moved on, so don't change anything
                }
                const newModalState = {
                    modalType: MODAL_TYPE_HINT,
                    escapeAction: 'close',
                };
                if (analysis) {
                    try {
                        const explainer = new SudokuExplainer(analysis);  // might throw exception
                        grid = grid.set("explainer", explainer);
                        newModalState.hint = modelHelpers.findNextHint(grid);
                    }
                    catch (error) {
                        errorMessage = error.toString();
                    }
                }
                if (errorMessage) {
                    newModalState.loadingFailed = true;
                    newModalState.errorMessage = errorMessage;
                }
                return grid.set('modalState', newModalState);
            });
        };
        const tryRequest = () => {
            let userWaiting = true;
            setGrid(grid => {
                const modalState = grid.get('modalState');
                if (!modalState || modalState.modalType !== MODAL_TYPE_HINT) {
                    userWaiting = false;
                }
                return grid;
            })
            if (!userWaiting) {
                return;
            }
            if (retryCount++ > maxRetries) {
                setNewModalState({errorMessage: "Timed out waiting for hints from server."})
                return;
            }
            fetch(explainURL)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`${response.status} ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(analysis => {
                    if (analysis && analysis.ss) {
                        setNewModalState({analysis});
                    }
                    else {
                        setTimeout(tryRequest, retryInterval);
                    }
                })
                .catch(error => {
                    setNewModalState({errorMessage: error.toString()});
                });
        };
        tryRequest();
    },

    findNextHint: (grid) => {
        const explainer = grid.get("explainer");
        const currDigits = grid.get('cells').map(c => c.get('digit')).toArray();
        const currCandidates = grid.get("cells").map(c => {
            return c.get("innerPencils").union(c.get("outerPencils")).toArray().join('');
        }).toArray();
        return explainer.findNextStep(currDigits, currCandidates);
    },

    checkDigits: (digits, finalDigits) => {
        const result = {
            isSolved: false,
        };
        let incompleteCount = 0;
        const seen = { row: {}, col: {}, box: {} };
        const digitTally = {};
        const errorAtIndex = {};
        for (let i = 0; i < 81; i++) {
            const d = digits[i] || '0';
            if (d === '0') {
                incompleteCount++;
            }
            else {
                const c = cellProp[i];
                for (const setType of ['row', 'col', 'box']) {
                    const j = c[setType];
                    seen[setType][j] = seen[setType][j] || {};
                    const k = seen[setType][j][d];
                    if (k === undefined) {
                        seen[setType][j][d] = i;
                    }
                    else {
                        const error = `Digit ${d} in ${setType} ${j}`;
                        errorAtIndex[i] = errorAtIndex[i] || error;
                        errorAtIndex[k] = errorAtIndex[k] || error;
                    }
                }
                digitTally[d] = (digitTally[d] || 0) + (errorAtIndex[i] ? 0 : 1);
            }
        }
        result.completedDigits = "123456789".split('').reduce((c, d) => {
            c[d] = (digitTally[d] === 9);
            return c;
        }, {});
        let errorCount = Object.keys(errorAtIndex).length;
        if (finalDigits && errorCount === 0) {
            for (let i = 0; i < 81; i++) {
                if(digits[i] !== '0' && digits[i] !== finalDigits[i]) {
                    errorAtIndex[i] = 'Incorrect digit';
                    errorCount++;
                }
            }
        }
        if (errorCount > 0) {
            result.hasErrors = true;
            result.errorAtIndex = errorAtIndex;
        }
        else if (incompleteCount === 0) {
            result.isSolved = true;
        }
        else {
            result.incompleteCount = incompleteCount;
        }
        return result;
    },

    findCandidatesForCell: (digits, i) => {
        const candidates = '0123456789'.split('');
        const digitBase = '0'.charCodeAt(0);
        const r = Math.floor(i / 9) + 1;
        const c = (i % 9) + 1;
        const b = Math.floor((r - 1) / 3) * 3 + Math.floor((c - 1) / 3) + 1;
        [ cellSet.row[r], cellSet.col[c], cellSet.box[b] ].flat().forEach(j => {
            const d = digits[j] || '0';
            if (d !== '0') {
                const index = d.charCodeAt(0) - digitBase;
                candidates[index] = '0';
            }
        });
        return candidates.filter(d => d !== '0');
    },

    findSolutions: (digits, userOpt) => {
        const opt = {findAll: false, ...userOpt};
        const state = {
            findAll: opt.findAll,
            solutions: [],
            iterations: 0,
            maxTime: Date.now() + (opt.timeout || 3000),
        };
        const givensCount = digits.filter(d => d !== '0').length;
        if (givensCount < 17) {
            return {
                solutions: [],
                uniqueSolution: false,
                error: 'This arrangement may not have a unique solution',
            };
        }
        modelHelpers.tryCandidates(digits, state, 0);
        const solutions = state.solutions;
        const result = {
            solutions: solutions,
            uniqueSolution: false,
        };
        if (solutions.length === 1  && !state.timedOut) {
            result.uniqueSolution = true;
            result.finalDigits = solutions[0];
        }
        else if (solutions.length > 1 ) {
            result.error = 'This arrangement does not have a unique solution';
        }
        else if (state.timedOut) {
            result.error = 'The solver timed out while checking for a unique solution';
        }
        else {
            result.error = 'This arrangement does not have a solution';
        }
        return result;
    },

    tryCandidates: (digits, state, cellIndex) => {
        state.iterations++;
        if (cellIndex === 81) {
            state.solutions.push(digits.join(''));
            return;
        }
        if (state.timedOut) {
            return;
        }
        if ((state.iterations % 10000) === 0) {
            if (Date.now() > state.maxTime) {
                state.timedOut = true;
                return;
            }
        }
        if (digits[cellIndex] !== '0') {
            modelHelpers.tryCandidates(digits, state, cellIndex + 1);
            return;
        }
        modelHelpers.findCandidatesForCell(digits, cellIndex).forEach(d => {
            if (!state.findAll && state.solutions.length > 1) {
                return;
            }
            digits[cellIndex] = d;
            modelHelpers.tryCandidates(digits, state, cellIndex + 1);
        });
        digits[cellIndex] = '0';
        return;
    },

    pushNewSnapshot: (grid, snapshotBefore) => {
        const snapshotAfter = modelHelpers.toSnapshotString(grid);
        if (snapshotBefore !== snapshotAfter) {
            grid = grid
                .update('undoList', list => list.push(snapshotBefore))
                .set('redoList', List());
            grid = modelHelpers.setCurrentSnapshot(grid, snapshotAfter);
        }
        return grid;
    },

    setCurrentSnapshot: (grid, newSnapshot) => {
        grid = grid.set('currentSnapshot', newSnapshot);
        const watcher = grid.get('storeCurrentSnapshot');
        if (watcher) {
            watcher(newSnapshot);
        }
        return grid;
    },

    undoOneAction: (grid) => {
        return modelHelpers.retainSelection(grid, (grid) => {
            const undoList = grid.get('undoList');
            if (actionsBlocked(grid) || undoList.size < 1) {
                return grid;
            }
            const beforeUndo = grid.get('currentSnapshot');
            const snapshot = undoList.last();
            grid = modelHelpers.restoreSnapshot(grid, snapshot)
                .set('undoList', undoList.pop())
                .update('redoList', list => list.push(beforeUndo));
            return modelHelpers.checkCompletedDigits(grid);
        });
    },

    redoOneAction: (grid) => {
        return modelHelpers.retainSelection(grid, (grid) => {
            const redoList = grid.get('redoList');
            if (actionsBlocked(grid) || redoList.size < 1) {
                return grid;
            }
            const beforeRedo = grid.get('currentSnapshot');
            const snapshot = redoList.last();
            grid = modelHelpers.restoreSnapshot(grid, snapshot)
                .set('redoList', redoList.pop())
                .update('undoList', list => list.push(beforeRedo));
            return modelHelpers.checkCompletedDigits(grid);
        });
    },

    updateCellSnapshotCache: (c) => {
        const digit = c.get('digit');
        const colorCode = c.get('colorCode');
        let cs = '';
        if (digit !== '0' && !c.get('isGiven')) {
            cs = cs + 'D' + digit;
        }
        else {
            const inner = c.get('innerPencils').toArray().sort().join('');
            const outer = c.get('outerPencils').toArray().sort().join('');
            cs = cs +
                (outer === '' ? '' : ('T' + outer)) +
                (inner === '' ? '' : ('N' + inner));
        }
        if (colorCode !== '1') {
            cs = cs + 'C' + colorCode;
        }
        return c.set('snapshot', cs);
    },

    toSnapshotString: (grid) => {
        const cells = grid.get('cells');
        const snapshot = cells.filter(c => {
            return c.get('snapshot') !== '';
        }).map(c => {
            return [c.get('row'), c.get('col'), c.get('snapshot')].join('');
        }).toArray().join(',');
        return snapshot;
    },

    parseSnapshotString: (snapshot) => {
        const parsed = {};
        snapshot.split(',').forEach(csn => {
            const props = {
                digit: '0',
                innerPencils: [],
                outerPencils: [],
                colorCode: '1',
                snapshot: '',
            };
            const index = indexFromRC(csn);
            props.snapshot = csn.substr(2);
            let state = null;
            for(let i = 2; i < csn.length; i++) {
                const char = csn[i];
                if (char === 'D') {
                    props.digit = csn[i+1];
                    i++;
                }
                else if (char === 'C') {
                    props.colorCode = csn[i+1];
                    i++;
                }
                else if (char === 'T' || char === 'N') {
                    state = char;
                }
                else if ('0' <= char && char <= '9') {
                    if (state === 'T') {
                        props.outerPencils.push(csn[i]);
                    }
                    else if (state === 'N') {
                        props.innerPencils.push(csn[i]);
                    }
                }
                // else ignore any other character
            }
            parsed[index] = props;
        });
        return parsed;
    },

    restoreSnapshot: (grid, snapshot) => {
        const parsed = modelHelpers.parseSnapshotString(snapshot);
        const empty = {
            digit: '0',
            colorCode: '1',
            outerPencils: [],
            innerPencils: [],
            snapshot: '',
        };
        const newCells = grid.get('cells').map(c => {
            const index = c.get('index');
            const props = parsed[index] || empty;
            if (c.get('isGiven')) {
                if (c.get('colorCode') !== props.colorCode) {
                    c = c.merge({
                        colorCode: props.colorCode,
                        snapshot: props.snapshot,
                    });
                }
            }
            else {
                c = c.merge({
                    digit: props.digit,
                    colorCode: props.colorCode,
                    outerPencils: Set(props.outerPencils),
                    innerPencils: Set(props.innerPencils),
                    snapshot: props.snapshot,
                });
            }
            return c;
        });
        grid = grid.set('cells', newCells);
        return modelHelpers.setCurrentSnapshot(grid, snapshot);
    },

    retainSelection: (grid, operation) => {
        const isSelected = grid.get('cells').filter(c => c.get('isSelected')).reduce((s, c) => {
            s[c.get('index')] = true;
            return s;
        }, {});

        grid = operation(grid);

        const newCells = grid.get('cells').map(c => {
            return (c.get('isSelected') === (isSelected[c.get('index')] || false))
                ? c
                : c.set('isSelected', true);
        });
        return grid.set('cells', newCells);
    },

    showWelcomeModal: (grid) => {
        return grid.set('modalState', {
            modalType: MODAL_TYPE_WELCOME,
            loading: true,
            fetchRequired: true,
        });
    },

    confirmRestart: (grid) => {
        return grid.set('modalState', {
            modalType: MODAL_TYPE_CONFIRM_RESTART,
            escapeAction: 'close',
        });
    },

    confirmClearColorHighlights: (grid) => {
        const coloredCount = grid.get('cells').count(c => c.get('colorCode') !== '1')
        if (coloredCount > 0) {
            return grid.set('modalState', {
                modalType: MODAL_TYPE_CONFIRM_CLEAR_COLOR_HIGHLIGHTS,
                escapeAction: 'close',
            });
        }
        return grid;
    },

    showShareModal: (grid) => {
        return grid.set('modalState', {
            modalType: MODAL_TYPE_SHARE,
            initialDigits: grid.get('initialDigits'),
            difficultyLevel: grid.get('difficultyLevel'),
            startTime: grid.get('startTime'),
            endTime: grid.get('endTime'),
            escapeAction: 'close',
        });
    },

    showPasteModal: (grid) => {
        return grid.set('modalState', {
            modalType: MODAL_TYPE_PASTE,
            escapeAction: 'cancel-paste',
        });
    },

    showSolverModal: (grid) => {
        const passProgressSetting = modelHelpers.getSetting(grid, SETTINGS.passProgressToSolver);
        return grid.set('modalState', {
            modalType: MODAL_TYPE_SOLVER,
            initialDigits: grid.get('initialDigits'),
            allDigits: grid.get('cells').map(c => c.get('digit')).join(''),
            passProgressSetting,
            escapeAction: 'close',
        });
    },

    showQRModal: (grid, puzzleURL) => {
        return grid.set('modalState', {
            modalType: MODAL_TYPE_QR_CODE ,
            puzzleURL,
            escapeAction: 'show-share-modal',
        });
    },

    showSettingsModal: (grid) => {
        return grid.set('modalState', {
            modalType: MODAL_TYPE_SETTINGS,
            currentSettings: grid.get('settings'),
            escapeAction: 'close',
        });
    },

    showHintModal: (grid) => {
        // Alert user of any error first if there are any
        grid = modelHelpers.gameOverCheck(grid);
        const modalState = grid.get('modalState');
        if (modalState && modalState.icon !== 'ok') {
            return grid;
        }
        grid = grid.set('modalState', undefined);

        // Make sure we have hints available
        const explainer = grid.get('explainer');
        if (!explainer) {
            return grid.set('modalState', {
                modalType: MODAL_TYPE_HINT,
                fetchRequired: true,
                loading: true,
                retries: 10,
            });
        }
        const currDigits = grid.get('cells').map(c => c.get('digit')).toArray();
        const currCandidates = grid.get("cells").map(c => {
            return c.get("innerPencils").union(c.get("outerPencils")).toArray().join('');
        }).toArray();
        const hint = explainer.findNextStep(currDigits, currCandidates);
        if (hint) {
            grid = grid.set('modalState', {
                modalType: MODAL_TYPE_HINT,
                escapeAction: 'close',
                hint: hint,
            });
        }
        else {
            grid = grid.set('modalState', {
                modalType: MODAL_TYPE_HINT,
                escapeAction: 'close',
                noHint: true,
            });
        }
        return grid;
    },

    showHelpPage: (grid) => {
        return grid.set('modalState', {
            modalType: MODAL_TYPE_HELP,
            escapeAction: 'close',
        });
    },

    showAboutModal: (grid) => {
        return grid.set('modalState', {
            modalType: MODAL_TYPE_ABOUT,
            escapeAction: 'close',
         });
    },

    showFeaturesModal: (grid) => {
        return grid.set('modalState', {
            modalType: MODAL_TYPE_FEATURES,
            availableFeatures: AVAILABLE_FEATURE_FLAGS,
            enabledFeatures: grid.get("featureFlags"),
            escapeAction: 'goto-main-entry',
         });
    },

    applyModalAction: (grid, args) => {
        const action = args.action || args;
        grid = grid.set('modalState', undefined);
        if (action === 'cancel') {
            return grid;
        }
        else if (action === 'cancel-paste') {
            return modelHelpers.showWelcomeModal(grid);
        }
        else if (action === 'cancel-solver') {
            return modelHelpers.saveSolverPreferences(grid, args.passProgress);
        }
        else if (action === 'goto-main-entry') {
            window.location.href = window.location.href.replace(/[?#].*$/, "");
            return grid;
        }
        else if (action === 'show-share-modal') {
            return modelHelpers.showShareModal(grid);
        }
        else if (action === 'retry-initial-digits') {
            return modelHelpers.retryInitialDigits(grid, args.digits);
        }
        else if (action === 'show-paste-modal') {
            return modelHelpers.showPasteModal(grid);
        }
        else if (action === 'show-qr-modal') {
            return modelHelpers.showQRModal(grid, args.puzzleURL);
        }
        else if (action === 'paste-initial-digits') {
            return modelHelpers.retryInitialDigits(grid, args.digits);
        }
        else if (action === 'save-settings') {
            return modelHelpers.applyNewSettings(grid, args.newSettings);
        }
        else if (action === 'save-feature-flags') {
            return modelHelpers.applyNewFeatureFlags(grid, args.newFeatureFlags);
        }
        else if (action === 'restart-confirmed') {
            return modelHelpers.applyRestart(grid);
        }
        else if (action === 'clear-color-highlights-confirmed') {
            return modelHelpers.applyClearColorHighlights(grid);
        }
        else if (action === 'resume-timer') {
            return modelHelpers.resumeTimer(grid);
        }
        return grid;
    },

    retryInitialDigits: (grid, digits) => {
        window.location.search = `s=${digits}`;
        return grid;
    },

    applyNewSettings: (grid, newSettings) => {
        // If simple pencil marking mode is being changed from 'off' to 'on' collapse
        // all pencil marks to inner.
        const oldSimpleMode = modelHelpers.getSetting(grid, SETTINGS.simplePencilMarking);
        if (!oldSimpleMode && newSettings[SETTINGS.simplePencilMarking]) {
            grid = modelHelpers.collapseAllOuterPencilMarks(grid);
        }
        return modelHelpers.saveSettings(grid, newSettings);
    },

    applyNewFeatureFlags: (grid, newFeatureFlags) => {
        grid = modelHelpers.saveFeatureFlags(grid, newFeatureFlags);
        window.location.href = window.location.href.replace(/[?#].*$/, "");
        return grid;
    },

    collapseAllOuterPencilMarks: (grid) => {
        const newCells = grid.get('cells').map(c => {
            return modelHelpers.updateCellSnapshotCache(
                modelHelpers.pencilMarksToInnerAsCellOp(c)
            );
        });
        grid = grid.set('cells', newCells);
        const snapshotAfter = modelHelpers.toSnapshotString(grid);
        return modelHelpers.setCurrentSnapshot(grid, snapshotAfter);
    },

    applyRestart: (grid) => {
        if (grid.get('solved')) {
            grid = grid.merge({
                'solved': false,
                'startTime': Date.now(),
                'endTime': undefined,
            })
        }
        const emptySnapshot = '';
        grid = modelHelpers.restoreSnapshot(grid, emptySnapshot)
            .merge({
                'undoList': List(),
                'redoList': List(),
                'focusIndex': null,
                'matchDigit': '0',
                'completedDigits': {},
                'inputMode': 'digit',
            });
        return modelHelpers.checkCompletedDigits(grid);
    },

    saveSolverPreferences: (grid, passProgress) => {
        const allSettings = grid.get('settings');
        if (allSettings[SETTINGS.passProgressToSolver] === passProgress) {
            return grid;
        }
        const newSettings = { ...allSettings, [SETTINGS.passProgressToSolver]: passProgress }
        return modelHelpers.saveSettings(grid, newSettings);
    },

    trackSnapshotsForUndo: (grid, f) => {
        const snapshotBefore = grid.get('currentSnapshot');
        grid = f(grid);
        return modelHelpers.pushNewSnapshot(grid, snapshotBefore);
    },

    applyClearColorHighlights: (grid) => {
        return modelHelpers.trackSnapshotsForUndo(grid, grid => {
            const cells = grid.get('cells').map(c => {
                if (c.get('colorCode') !== '1') {
                    c = modelHelpers.updateCellSnapshotCache( c.set('colorCode', '1') );
                }
                return c;
            });
            return grid.merge({
                cells: cells,
                inputMode: 'digit',
            });
        });
    },

    gameOverCheck: (grid) => {
        const digits = grid.get('cells').map(c => c.get('digit')).join('');
        const finalDigits = grid.get('finalDigits');
        const result = modelHelpers.checkDigits(digits, finalDigits);
        if (result.hasErrors) {
            grid = modelHelpers.applyErrorHighlights(grid, result.errorAtIndex);
            grid = grid.set('modalState', {
                modalType: MODAL_TYPE_CHECK_RESULT,
                icon: 'error',
                errorMessage: 'Errors found in highlighted cells',
                escapeAction: 'close',
            });
        }
        else if (grid.get('mode') === 'enter') {
            const digits = grid.get('cells').map(c => c.get('digit')).toArray();
            const result = modelHelpers.findSolutions(digits);
            if (result.uniqueSolution) {
                grid = grid.set('modalState', {
                    modalType: MODAL_TYPE_CHECK_RESULT,
                    icon: 'ok',
                    errorMessage: 'Looks good - this arrangement has a unique solution',
                    escapeAction: 'close',
                });
            }
            else {
                grid = grid.set('modalState', {
                    modalType: MODAL_TYPE_CHECK_RESULT,
                    icon: 'warning',
                    errorMessage: result.error,
                    escapeAction: 'close',
                });
            }
        }
        else if (result.incompleteCount) {
            const s = result.incompleteCount === 1 ? '' : 's';
            grid = grid.set('modalState', {
                modalType: MODAL_TYPE_CHECK_RESULT,
                icon: 'ok',
                errorMessage: `No conflicting digits were found, but ${result.incompleteCount} cell${s} not yet filled`,
                escapeAction: 'close',
            });
        }
        return grid;
    },

    applyErrorHighlights: (grid, errorAtIndex = {}) => {
        if (!modelHelpers.getSetting(grid, SETTINGS.highlightConflicts)) {
            return grid;
        }
        const cells = grid.get('cells').map((c) => {
            const index = c.get('index');
            const ok = (
                c.get('isGiven')
                || (c.get('errorMessage') === errorAtIndex[index])
            );
            return ok ? c : c.set('errorMessage', errorAtIndex[index]);
        });
        return grid.set('cells', cells);
    },

    defaultDigitOpForSelection: (grid) => {
        const selection = grid.get("cells").filter((c) => c.get("isSelected"));
        if (selection.size < 2) {
            return 'setDigit';
        }
        const seen = {};
        const sameRegion = selection.find(c => {
            return ["row", "col", "box"].find(rType => {
                const region = rType + c.get(rType);
                const wasSeen = seen[region];
                seen[region] = true;
                return wasSeen;
            })
        })
        return sameRegion ? 'toggleOuterPencilMark' : 'setDigit';
    },

    selectionHasMatch: (grid, testFunc) => {
        const selection = grid.get("cells").filter((c) => c.get("isSelected"));
        return !!(selection.find(testFunc));
    },

    updateSelectedCells: (grid, opName, ...args) => {
        if (actionsBlocked(grid)) {
            return grid;
        }
        const isSimpleMode = modelHelpers.getSetting(grid, SETTINGS.simplePencilMarking);
        if (opName === 'toggleOuterPencilMark' && isSimpleMode) {
            opName = 'toggleInnerPencilMark'
        }
        if (opName === 'toggleInnerPencilMark' || opName === 'toggleOuterPencilMark') {
            const [digit] = args;
            const setName = opName === 'toggleInnerPencilMark' ? 'innerPencils' : 'outerPencils'
            const setMode = modelHelpers.selectionHasMatch(grid, c => {
                return c.get('digit') !== '0'
                        ? false  // ignore full digits in selection
                        : !c.get(setName).includes(digit);
            });
            args = [digit, setMode];
        }
        const mode = grid.get('mode');
        const op = modelHelpers[opName + 'AsCellOp'];
        if (!op) {
            console.log(`Unknown cell update operation: '${opName}'`);
            return grid;
        }
        if (opName === 'setDigit' && args[1] && args[1].replaceUndo) {
            grid = modelHelpers.undoOneAction(grid);
        }
        const snapshotBefore = grid.get('currentSnapshot');
        let newCells = grid.get('cells')
            .map(c => {
                const canUpdate = (!c.get('isGiven') || opName === 'setCellColor' || opName === 'clearCell');
                if (canUpdate && c.get('isSelected')) {
                    return modelHelpers.updateCellSnapshotCache( op(c, ...args) );
                }
                else {
                    return c;
                }
            });
        if (opName === 'setDigit' && modelHelpers.getSetting(grid, SETTINGS.autocleanPencilmarks)) {
            newCells = modelHelpers.autoCleanPencilMarks(newCells, args[0]);
        }
        grid = grid.set('cells', newCells);
        const snapshotAfter = modelHelpers.toSnapshotString(grid);
        if (mode === 'solve' && snapshotAfter === snapshotBefore) {
            return grid;
        }
        grid = modelHelpers.checkCompletedDigits(grid);
        if (mode === 'enter' && opName === 'setDigit') {
            grid = modelHelpers.autoAdvanceFocus(grid);
        }
        else if (
            opName === 'setDigit'
            || opName === 'toggleInnerPencilMark'
            || opName === 'toggleOuterPencilMark'
        ) {
            const newDigit = args[0];
            grid = grid.set('matchDigit', newDigit);
        }
        else if (opName === 'clearCell') {
            grid = grid.set('matchDigit', '0');
        }
        return modelHelpers.pushNewSnapshot(grid, snapshotBefore);
    },

    setDigitAsCellOp: (c, newDigit) => {
        if (c.get('digit') === newDigit) {
            return c;
        }
        return c.merge({
            'digit': newDigit,
            'outerPencils': emptySet,
            'innerPencils': emptySet,
            'errorMessage': undefined,
        });
    },

    clearCellAsCellOp: (c) => {
        return c.get('isGiven')
        ? c.set('colorCode', '1')
        : c.merge({
            digit: '0',
            outerPencils: emptySet,
            innerPencils: emptySet,
            colorCode: '1',
            errorMessage: undefined,
        });
    },

    toggleInnerPencilMarkAsCellOp: (c, digit, setMode) => {
        if (c.get('digit') !== '0') {
            return c;
        }
        let pencilMarks = c.get('innerPencils');
        pencilMarks = setMode
            ? pencilMarks.add(digit)
            : pencilMarks.delete(digit);
        return c.set('innerPencils', pencilMarks);
    },

    toggleOuterPencilMarkAsCellOp: (c, digit, setMode) => {
        if (c.get('digit') !== '0') {
            return c;
        }
        let pencilMarks = c.get('outerPencils');
        pencilMarks = setMode
            ? pencilMarks.add(digit)
            : pencilMarks.delete(digit);
        return c.set('outerPencils', pencilMarks);
    },

    pencilMarksToInnerAsCellOp: (c) => {
        if (c.get('digit') !== '0') {
            return c;
        }
        let newInner = c.get('innerPencils').union(c.get('outerPencils'));
        return c.merge({
            'innerPencils': newInner,
            'outerPencils': emptySet,
        });
    },

    setCellColorAsCellOp: (c, newColorCode) => {
        return c.set('colorCode', newColorCode);
    },

    autoCleanPencilMarks: (cells, newDigit) => {
        let isEliminated = {};
        cells.forEach(c => {
            if (c.get('isSelected') && !c.get('isGiven')) {
                [
                    cellSet.row[c.get('row')],
                    cellSet.col[c.get('col')],
                    cellSet.box[c.get('box')],
                ].flat().forEach(i => isEliminated[i] = true);
            }
        });
        return cells.map(c => {
            const i = c.get('index');
            if (c.get('digit') === '0' && isEliminated[i]) {
                const inner = c.get('innerPencils');
                const outer = c.get('outerPencils');
                if (inner.includes(newDigit) || outer.includes(newDigit)) {
                    return modelHelpers.updateCellSnapshotCache(
                        c.merge({
                            innerPencils: inner.delete(newDigit),
                            outerPencils: outer.delete(newDigit),
                        })
                    );
                }
            }
            return c;
        });
    },

    checkCompletedDigits: (grid) => {
        const digits = grid.get('cells').map(c => c.get('digit')).join('');
        const result = modelHelpers.checkDigits(digits);
        grid = grid.set('completedDigits', result.completedDigits);
        if (result.isSolved && !grid.get('endTime')) {
            return modelHelpers.setGridSolved(grid);
        }
        grid = modelHelpers.applyErrorHighlights(grid, result.errorAtIndex);
        return grid.set('hasErrors', !!result.hasErrors);
    },

    pauseTimer: (grid) => {
        return grid.merge({
            pausedAt: Date.now(),
            modalState: {
                modalType: MODAL_TYPE_PAUSED,
                escapeAction: 'resume-timer',
            },
        });
    },

    resumeTimer: (grid) => {
        const elapsed = grid.get('pausedAt') - grid.get('startTime');
        return grid.merge({
            pausedAt: undefined,
            startTime: Date.now() - elapsed,
        });
    },

    toggleShowPencilmarks: (grid) => {
        return grid.update('showPencilmarks', flag => !flag);
    },

    clearPencilmarks: (grid) => {
        return modelHelpers.trackSnapshotsForUndo(grid, grid => {
            const cells = grid.get('cells');
            const clearSnapshot = cells.filter(c => !c.get('isGiven') && c.get('digit') !== '0')
                .map(c => {
                    return [c.get('row'), c.get('col'), 'D', c.get('digit')].join('');
                })
                .join(',');
            return modelHelpers.restoreSnapshot(grid, clearSnapshot);
        });
    },

    showCalculatedCandidates: (grid) => {
        const snapshotBefore = grid.get('currentSnapshot');
        const hinter = modelHelpers.hinter(grid);
        const candidates = hinter.calculateCellCandidates();
        const cells = grid.get('cells').map((c, i) => {
            const cellCandidates = candidates[i];
            return cellCandidates === null
                ? c
                : modelHelpers.updateCellSnapshotCache(c.merge({
                      innerPencils: Set(cellCandidates),
                      outerPencils: emptySet,
                  }));
        });
        grid = grid.set('cells', cells);
        grid = modelHelpers.applySelectionOp(grid, 'clearSelection');
        return modelHelpers.pushNewSnapshot(grid, snapshotBefore);
    },

    setGridSolved: (grid) => {
        return modelHelpers.applySelectionOp(grid, 'clearSelection')
            .set('solved', true)
            .set('endTime', Date.now());
    },

    applySelectionOp: (grid, opName, ...args) => {
        if (actionsBlocked(grid)) {
            return grid;
        }
        const op = modelHelpers[opName];
        if (!op) {
            console.log(`Unknown cell operation: '${opName}'`);
            return grid;
        }
        const newCells = grid.get('cells').map(c => op(c, ...args));
        if (opName === 'setSelection' || opName === 'extendSelection') {
            const currIndex = args[0];
            grid = grid.set('focusIndex', currIndex);
            if (opName === 'setSelection') {
                const currDigit = newCells.get(currIndex).get('digit');
                grid = grid.set('matchDigit', currDigit);
            }
        }
        else if (opName === 'clearSelection') {
            grid = grid.set('matchDigit', '0');
        }
        return grid.set('cells', newCells);
    },

    setSelection: (c, index) => {
        if (c.get('index') === index) {
            return c.set('isSelected', true);
        }
        else if (c.get('isSelected')) {
            return c.set('isSelected', false);
        }
        return c;
    },

    extendSelection: (c, index) => {
        if (c.get('index') === index && !c.get('isSelected')) {
            return c.set('isSelected', true);
        }
        return c;
    },

    toggleExtendSelection: (c, index) => {
        if (c.get('index') === index) {
            return c.set('isSelected', !c.get('isSelected'));
        }
        return c;
    },

    clearSelection: (c) => {
        if (c.get('isSelected')) {
            return c.set('isSelected', false);
        }
        return c;
    },

    moveFocus: (grid, deltaX, deltaY, isExtend) => {
        let focusIndex = grid.get('focusIndex');
        if (focusIndex === null) {
            focusIndex = modelHelpers.CENTER_CELL;
        }
        else  {
            const newCol = (9 + focusIndex % 9 + deltaX) % 9;
            const newRow = (9 + Math.floor(focusIndex / 9) + deltaY) % 9;
            focusIndex = newRow * 9 + newCol;
        }
        const operation = isExtend ? 'extendSelection' : 'setSelection';
        return modelHelpers.applySelectionOp(grid, operation, focusIndex);
    },

    autoAdvanceFocus: (grid) => {
        const cells = grid.get('cells')
        const focusIndex = grid.get('focusIndex');
        const focusCell = cells.get(focusIndex);
        if (focusCell && focusCell.get('errorMessage') !== undefined) {
            return grid;
        }
        if (cells.filter(c => c.get('isSelected')).size !== 1) {
            return grid;
        }
        grid = modelHelpers.moveFocus(grid, 1, 0, false);
        if (grid.get('focusIndex') % 9 === 0) {
            grid = modelHelpers.moveFocus(grid, 0, 1, false);
        }
        return grid;
    },

    setInputMode: (grid, newMode) => {
        if (actionsBlocked(grid)) {
            return grid;
        }
        if (newMode.match(/^(digit|inner|outer|color)$/)) {
            grid = grid.set('inputMode', newMode);
        }
        return grid;
    },

    setTempInputMode: (grid, newMode) => {
        if (actionsBlocked(grid)) {
            return grid;
        }
        if (newMode.match(/^(inner|outer|color)$/)) {
            grid = grid.set('tempInputMode', newMode);
        }
        return grid;
    },

    clearTempInputMode: (grid) => {
        return grid.set('tempInputMode', undefined);
    },

    asDigits: (grid) => {
        return grid.get('cells').map(c => c.get('digit')).join('');
    },

}
