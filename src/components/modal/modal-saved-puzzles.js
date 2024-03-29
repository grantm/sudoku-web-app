import { compressPuzzleDigits } from '../../lib/string-utils';

import SavedPuzzleGrid from "../saved-puzzle/saved-puzzle-grid";
import SavedPuzzleMetadata from "../saved-puzzle/saved-puzzle-metadata";


function puzzleLink(puzzleState, shortenLinks) {
    const {initialDigits, difficultyLevel} = puzzleState;
    const puzzleString = shortenLinks ? compressPuzzleDigits(initialDigits) : initialDigits;
    const diffParam = difficultyLevel ? `&d=${difficultyLevel}` : '';
    return `./?s=${puzzleString}${diffParam}&r=1`;
}


function SavedPuzzle({puzzleState, showRatings, shortenLinks, discardHandler, isLast}) {
    const {
        puzzleStateKey, difficultyLevel,
        startTime, elapsedTime, lastUpdatedTime
    } = puzzleState;
    const puzzleButtons = discardHandler
        ? (
            <div className="puzzle-buttons">
                <a className="btn primary" href={puzzleLink(puzzleState, shortenLinks)}>Select</a>
                <button
                    onClick={discardHandler}
                    data-puzzle-state-key={puzzleStateKey}
                    title="Discard this saved puzzle"
                >Discard</button>
            </div>
        )
        : null;
    return <div className={`saved-puzzle ${isLast ? 'last' : ''}`}>
        <a className="puzzle-selector" href={puzzleLink(puzzleState, shortenLinks)}>
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


function OneSavedPuzzle({puzzleState, showRatings, shortenLinks, discardHandler, cancelHandler}) {
    return <>
        <h1>Continue or discard?</h1>
        <p>Click <b>Continue</b> to return to this saved puzzle and pick up where
        you left off, <b>Discard</b> to forget it, or <b>Cancel</b> to go back to the main menu.</p>
        <SavedPuzzle
            puzzleState={puzzleState}
            showRatings={showRatings}
            shortenLinks={shortenLinks}
            isLast={true}
        />
        <div className="buttons">
            <a className="btn primary" href={puzzleLink(puzzleState, shortenLinks)}>Continue</a>
            <button className="cancel" onClick={discardHandler}
                data-puzzle-state-key={puzzleState.puzzleStateKey}>Discard</button>
            <button className="cancel" onClick={cancelHandler}>Cancel</button>
        </div>
    </>;
}


function SavedPuzzleList({savedPuzzles=[], showRatings, shortenLinks, discardHandler, cancelHandler}) {
    const puzzles = savedPuzzles.map((puzzleState, i) => {
        return <SavedPuzzle
            key={puzzleState.puzzleStateKey}
            puzzleState={puzzleState}
            showRatings={showRatings}
            shortenLinks={shortenLinks}
            discardHandler={discardHandler}
            isLast={i === savedPuzzles.length - 1}
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
    const {savedPuzzles, showRatings, shortenLinks} = modalState;
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
                shortenLinks={shortenLinks}
                discardHandler={discardHandler}
                cancelHandler={cancelHandler}
            />
          )
        : (
             <SavedPuzzleList
                 savedPuzzles={savedPuzzles}
                 showRatings={showRatings}
                 shortenLinks={shortenLinks}
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
