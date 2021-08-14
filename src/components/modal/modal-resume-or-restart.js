import React from 'react';

import SavedPuzzleGrid from "../saved-puzzle/saved-puzzle-grid";
import SavedPuzzleMetadata from "../saved-puzzle/saved-puzzle-metadata";

function ModalResumeRestart({modalState, modalHandler}) {
    const {puzzleState, showRatings} = modalState;
    const {puzzleStateKey, difficultyLevel, startTime, lastUpdatedTime, elapsedTime} = puzzleState;
    const resumeHandler = () => modalHandler({
        action: 'resume-saved-puzzle',
        puzzleStateKey
    });
    const restartHandler = () => modalHandler({
        action: 'restart-over-saved-puzzle',
        puzzleStateKey
    });
    return (
        <div className="modal resume-restart">
            <h1>Continue or start over?</h1>
            <p>You've made a start on this puzzle already. You can either pick up
            where you left off, or start again from the beginning.</p>
            <div className="saved-puzzle-detail">
                <SavedPuzzleGrid
                    puzzleState={puzzleState}
                    showRatings={showRatings}
                />
                <SavedPuzzleMetadata
                    difficultyLevel={difficultyLevel}
                    startTime={startTime}
                    lastUpdatedTime={lastUpdatedTime}
                    elapsedTime={elapsedTime}
                />
            </div>
            <div className="buttons">
                <button className="primary" onClick={resumeHandler} autoFocus={true}>Continue</button>
                <button className="primary" onClick={restartHandler}>Restart</button>
            </div>
        </div>
    );
}


export default ModalResumeRestart;
