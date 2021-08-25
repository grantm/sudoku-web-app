import React from 'react';

import SavedPuzzleGrid from "../saved-puzzle/saved-puzzle-grid";
import SavedPuzzleMetadata from "../saved-puzzle/saved-puzzle-metadata";


function puzzleLink(puzzleState) {
    const {initialDigits, difficultyLevel} = puzzleState;
    const diffParam = difficultyLevel ? `&d=${difficultyLevel}` : '';
    return `./?s=${initialDigits}${diffParam}&r=1`;
}


function SavedPuzzle({puzzleState, showRatings, discardHandler}) {
    const {
        puzzleStateKey, difficultyLevel,
        startTime, elapsedTime, lastUpdatedTime
    } = puzzleState;
    const puzzleButtons = discardHandler
        ? (
            <div className="puzzle-buttons">
                <a className="btn primary" href={puzzleLink(puzzleState)}>Select</a>
                <button
                    onClick={discardHandler}
                    data-puzzle-state-key={puzzleStateKey}
                    title="Discard this saved puzzle"
                >Discard</button>
            </div>
        )
        : null;
    return <div className="saved-puzzle">
        <a className="puzzle-selector" href={puzzleLink(puzzleState)}>
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
        {puzzleButtons}
    </div>;
}


function OneSavedPuzzle({puzzleState, showRatings, discardHandler, cancelHandler}) {
    return <>
        <h1>Continue or discard?</h1>
        <p>You can either return to this saved puzzle and<br />
        pick up where you left off, or you can discard it.</p>
        <SavedPuzzle
            puzzleState={puzzleState}
            showRatings={showRatings}
        />
        <div className="buttons">
            <a className="btn primary" href={puzzleLink(puzzleState)}>Continue</a>
            <button className="cancel" onClick={discardHandler}
                data-puzzle-state-key={puzzleState.puzzleStateKey}>Discard</button>
            <button className="cancel" onClick={cancelHandler}>Cancel</button>
        </div>
    </>;
}


function SavedPuzzleList({savedPuzzles=[], showRatings, discardHandler, cancelHandler}) {
    const puzzles = savedPuzzles.map((puzzleState, i) => {
        return <SavedPuzzle
            key={puzzleState.puzzleStateKey}
            puzzleState={puzzleState}
            showRatings={showRatings}
            discardHandler={discardHandler}
        />
    });
    return <>
        <h1>Incomplete puzzles</h1>
        <p>Select a puzzle to return to, or discard a partially completed puzzle</p>
        {puzzles}
        <div className="buttons">
            <button className="cancel" onClick={cancelHandler}>Cancel</button>
        </div>
    </>;
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
    const modalContent = (savedPuzzles || []).length === 1
        ? (
            <OneSavedPuzzle
                puzzleState={savedPuzzles[0]}
                showRatings={showRatings}
                discardHandler={discardHandler}
                cancelHandler={cancelHandler}
            />
           )
         : (
             <SavedPuzzleList
                 savedPuzzles={savedPuzzles}
                 showRatings={showRatings}
                 discardHandler={discardHandler}
                 cancelHandler={cancelHandler}
             />
           );
    return (
        <div className="modal saved-puzzles">
            {modalContent}
        </div>
    );
}


export default ModalSavedPuzzles;
