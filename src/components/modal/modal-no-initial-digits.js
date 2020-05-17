import React, { useState } from 'react';

import { modelHelpers } from '../../lib/sudoku-model.js';

import SudokuMiniGrid from '../sudoku-grid/sudoku-mini-grid';
import Spinner from '../spinner/spinner';


function RecentlySharedSection ({level, puzzles}) {
    const [collapsed, setCollapsed] = useState(true);
    const levelName = modelHelpers.difficultyLevelName(level);
    if (!levelName || !puzzles || puzzles.length < 1) {
        return null;
    }
    const puzzleLinks = puzzles.map((digits, i) => {
        return (
            <li key={i}>
                <a href={`/?s=${digits}&d=${level}`}>
                    <SudokuMiniGrid digits={digits} />
                </a>
            </li>
        );
    })
    const classes = `section ${collapsed ? 'collapsed' : ''}`;
    const clickHandler = () => setCollapsed(old => !old);
    return (
        <div className={classes} onClick={clickHandler}>
            <h2>{levelName}</h2>
            <ul>
                {puzzleLinks}
            </ul>
        </div>
    );
}


function RecentlyShared({modalState}) {
    if (modalState.loadingFailed) {
        return (
            <div className="loading-failed">Failed to load details of recently shared
            puzzles ({modalState.errorMessage})</div>
        );
    }
    else if (modalState.loading) {
        return <Spinner />;
    }
    const {recentlyShared} = modalState;
    const sections = ['1', '2', '3', '4'].map(level => {
        return <RecentlySharedSection key={level} level={level} puzzles={recentlyShared[level]} />;
    });
    return (
        <div className="recently-shared">
            {sections}
        </div>
    );
}


function ModalNoInitialDigits({modalState, modalHandler}) {
    const cancelHandler = () => modalHandler('cancel');
    return (
        <div className="modal no-initial-digits">
            <h1>Welcome to SudokuExchange</h1>
            <p>You can get started by entering a new puzzle into a blank grid:</p>
            <p style={{textAlign: 'center'}}><button className="primary new-puzzle" onClick={cancelHandler}>Enter a new puzzle</button></p>
            <p>Or you can select a recently shared puzzle:</p>
            <RecentlyShared modalState={modalState} />
        </div>
    );
}


export default ModalNoInitialDigits;
