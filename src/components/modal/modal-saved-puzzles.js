import React from 'react';

import SavedPuzzleGrid from "../saved-puzzle/saved-puzzle-grid";
import SavedPuzzleMetadata from "../saved-puzzle/saved-puzzle-metadata";


function SavedPuzzle({puzzleState, showRatings, discardHandler}) {
    const {
        puzzleStateKey, initialDigits, difficultyLevel,
        startTime, elapsedTime, lastUpdatedTime
    } = puzzleState;
    const diffParam = difficultyLevel ? `&d=${difficultyLevel}` : '';
    const puzzleLink = `./?s=${initialDigits}${diffParam}&r=1`;
    return <div className="saved-puzzle">
        <a className="puzzle-selector" href={puzzleLink}>
            <SavedPuzzleGrid
                puzzleState={puzzleState}
                showRatings={showRatings}
            />
        </a>
        <SavedPuzzleMetadata
            difficultyLevel={difficultyLevel}
            startTime={startTime}
            lastUpdatedTime={lastUpdatedTime}
            elapsedTime={elapsedTime}
        />
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
