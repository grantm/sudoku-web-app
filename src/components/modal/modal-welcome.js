import React, { useState } from 'react';

import { modelHelpers } from '../../lib/sudoku-model';

import SudokuMiniGrid from '../sudoku-grid/sudoku-mini-grid';
import Spinner from '../spinner/spinner';

function stopPropagation (e) {
    e.stopPropagation();
}

function RecentlySharedSection ({level, puzzles, showRatings}) {
    const [collapsed, setCollapsed] = useState(true);
    const levelName = modelHelpers.difficultyLevelName(level);
    if (!levelName || !puzzles || puzzles.length < 1) {
        return null;
    }
    const puzzleLinks = puzzles.map((puzzle, i) => {
        return (
            <li key={i}>
                <a href={`./?s=${puzzle.digits || puzzle}&d=${level}&i=${i+1}`} onClick={stopPropagation}>
                    <SudokuMiniGrid puzzle={puzzle} showRatings={showRatings} />
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
        return <RecentlySharedSection
            key={level}
            level={level}
            puzzles={recentlyShared[level]}
            showRatings={modalState.showRatings}
        />;
    });
    return (
        <div className="recently-shared">
            {sections}
        </div>
    );
}

function RestoreLocalSession() {
    const gameStateJson = localStorage.getItem('gamestate');
    if (!gameStateJson) {
        return null;
    }
    const gameState = JSON.parse(gameStateJson);
    if (!gameState || !gameState.currentSnapshot) {
        return null;
    }

    const restoreLocalSessionHandler = () => {
        const level = modelHelpers.difficultyLevelName(gameState.difficultyLevel);
        window.location.search = `s=${gameState.initialDigits}&d=${level}&r=1`
    }
    return (
      <p style={{textAlign: 'center'}}>
        <button
          className="primary"
          onClick={restoreLocalSessionHandler}
        >
          Continue unfinished game from{" "}
          {new Date(gameState.lastUpdatedTime).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          })}
        </button>
      </p>
    );
}


function ModalWelcome({modalState, modalHandler}) {
    const cancelHandler = () => modalHandler('cancel');
    const showPasteHandler = () => modalHandler('show-paste-modal');
    const twitterUrl = "https://twitter.com/SudokuExchange";
    return (
        <div className="modal welcome">
            <h1>Welcome to SudokuExchange</h1>
            <p>You can get started by entering a new puzzle into a blank grid:</p>
            <p style={{textAlign: 'center'}}><button className="primary new-puzzle" onClick={cancelHandler}>Enter a new puzzle</button></p>
            <p style={{textAlign: 'center'}}><button className="primary new-puzzle" onClick={showPasteHandler}>Paste a new puzzle</button></p>
            <RestoreLocalSession />
            <p>Or you can select a recently shared puzzle:</p>
            <RecentlyShared modalState={modalState} />
            <div id="welcome-footer">
                <p>Follow <a href={twitterUrl} target="_blank" rel="noreferrer">@SudokuExchange</a> on Twitter for updates.</p>
            </div>
        </div>
    );
}


export default ModalWelcome;
