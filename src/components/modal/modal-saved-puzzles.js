import React from 'react';

import SudokuMiniGrid from '../sudoku-grid/sudoku-mini-grid';

import { secondsAsHMS } from '../../lib/format-utils';


const difficultyLevelName = {
    "1": "Easy",
    "2": "Medium",
    "3": "Hard",
    "4": "Diabolical",
};

function formatDate(timestamp) {
    const dt = new Date(timestamp);
    return dt.toLocaleString({month: 'short'});
}


function formatDifficulty(difficulty) {
    return difficultyLevelName[difficulty] || <i>Unknown</i>;
}


function SavedPuzzle({puzzleState, showRatings, discardHandler}) {
    const {
        puzzleStateKey, initialDigits, completedDigits, difficultyLevel, difficultyRating,
        startTime, elapsedTime, lastUpdatedTime
    } = puzzleState;
    const puzzle = {
        digits: initialDigits,
        completedDigits: completedDigits,
        difficulty: difficultyRating,
    };
    const diffParam = difficultyLevel ? `&d=${difficultyLevel}` : '';
    const puzzleLink = `./?s=${initialDigits}${diffParam}&r=1`;
    return <div className="saved-puzzle">
        <a className="puzzle-selector" href={puzzleLink}>
            <SudokuMiniGrid puzzle={puzzle} showRatings={showRatings} />
        </a>
        <table className="metadata">
            <tbody>
                <tr>
                    <th>Difficulty:</th>
                    <td>{formatDifficulty(difficultyLevel)}</td>
                </tr>
                <tr>
                    <th>Started:</th>
                    <td>{formatDate(startTime)}</td>
                </tr>
                <tr>
                    <th>Last update:</th>
                    <td>{formatDate(lastUpdatedTime)}</td>
                </tr>
                <tr>
                    <th>Timer:</th>
                    <td>{secondsAsHMS(Math.floor(elapsedTime/1000))}</td>
                </tr>
            </tbody>
        </table>
        <div className="discard">
            <button
                onClick={discardHandler}
                data-puzzle-state-key={puzzleStateKey}
                title="Discard this saved puzzle"
            >×</button>
        </div>
    </div>;
}


function ModalSavedPuzzles({modalState, modalHandler}) {
    const {savedPuzzles, showRatings} = modalState;
    const cancelHandler = () => modalHandler('show-welcome-modal');
    const discardHandler = (e) => {
        const puzzleStateKey = e.target.dataset.puzzleStateKey;
        modalHandler({
            action: 'discard-saved-puzzle',
            puzzleStateKey,
        });
    };
    const puzzles = (savedPuzzles || []).map((puzzleState, i) => {
        return <SavedPuzzle
            key={puzzleState.puzzleStateKey}
            puzzleState={puzzleState}
            showRatings={showRatings}
            discardHandler={discardHandler}
        />
    });
    return (
        <div className="modal saved-puzzles">
            <h1>Incomplete puzzles</h1>
            <p>Select a puzzle to return to, or discard a partially completed puzzle</p>
            {puzzles}
            <div className="buttons">
                <button className="cancel" onClick={cancelHandler}>Cancel</button>
            </div>
        </div>
    );
}


export default ModalSavedPuzzles;
