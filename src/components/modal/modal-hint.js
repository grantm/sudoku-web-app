import React from 'react';

import Spinner from '../spinner/spinner';
import SudokuHintGrid from '../sudoku-grid/sudoku-hint-grid.js';

import { classList } from '../../lib/string-utils';

const solverURL = "https://github.com/SudokuMonster/SukakuExplainer/";


function DifficultyIndicator({hint}) {
    if (!hint.stepRating) {
        return null;
    }
    return (
        <div className="difficulty-indicator">
            <div className="title">Difficulty</div>
            <div className="rating-value for-step">{hint.stepRating}</div>
            <div className="rating-value for-puzzle">{hint.puzzleRating}</div>
            <div className="rating-label for-step">Step</div>
            <div className="rating-label for-puzzle">Puzzle</div>
        </div>
    );
}

function HintBody({hint}) {
    const digits = hint.digits;
    const candidates = hint.candidates;

    return (
        <div className="hint-body-layout">
            <SudokuHintGrid
                digits={digits}
                candidates={candidates}
                digitIndex={hint.digitIndex}
                digitValue={hint.digitValue}
                highlightCell={hint.highlightCell || {}}
                eliminationsByCell={hint.eliminationsByCell || {}}
            />
            <div className="hint-text-wrapper">
                <DifficultyIndicator hint={hint} />
                <div className="hint-text" dangerouslySetInnerHTML={{ __html: hint.html }} />
            </div>
        </div>
    );
}

function modalHintContent ({loading, loadingFailed, errorMessage, hint}) {
    if (loading) {
        return {
            title: "Loading hints",
            modalContent: <Spinner />,
            primaryButtonText: "Cancel",
        }
    }
    else if (loadingFailed) {
        const description = errorMessage === "Error: 400 Bad Request"
            ? (
                <p>The server was unable to provide hints for this puzzle.</p>
            )
            : (
                <p>An error occurred while requesting hints from the server.
                You may wish to try again later.</p>
            );
        return {
            title: "Failed to load hints",
            modalContent: description,
            primaryButtonText: "Cancel",
        }
    }
    else if (hint) {
        return {
            title: hint.title.replace(/,/g, ',\u200B'),
            modalContent: <HintBody hint={hint} />,
            primaryButtonText: "OK",
        }
    }
}

function HintButtons({hint, modalHandler, menuHandler, children}) {
    const closeHandler = () => modalHandler('cancel');

    const candidatesHandler = () => {
        menuHandler("calculate-candidates");
        modalHandler('cancel');
    };
    const candidatesButton = (hint && hint.needCandidates)
        ? <button onClick={candidatesHandler}>Auto Fill Candidates</button>
        : null;

    const applyHintHandler = () => {
        modalHandler({action: 'apply-hint', hint});
    }
    const applyHintButton = candidatesButton
        ? null
        : <button onClick={applyHintHandler}>Apply Hint</button>;

    return (
        <div className="buttons">
            {candidatesButton}
            {applyHintButton}
            <button className="primary" onClick={closeHandler}>{children}</button>
        </div>
    );
}

export default function ModalHint({modalState, modalHandler, menuHandler}) {
    const modalClasses = classList(
        "modal hint",
        modalState.loading && "loading",
    );

    const {title, modalContent, primaryButtonText} = modalHintContent(modalState);

    return (
        <div className={modalClasses}>
            <div className="hint-layout">
                <div className="hint-body">
                    <h1>{title}</h1>
                    {modalContent}
                    <HintButtons
                        hint={modalState.hint}
                        modalHandler={modalHandler}
                        menuHandler={menuHandler}
                    >{primaryButtonText}</HintButtons>
                </div>
                <div className="hint-footer">
                    <span>Hints by: <a target="_blank" rel="noopener noreferrer" href={solverURL}>Sukaku Explainer</a></span>
                </div>
            </div>
        </div>
    );
}
