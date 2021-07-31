import React from 'react';

import Spinner from '../spinner/spinner';
import SudokuHintGrid from '../sudoku-grid/sudoku-hint-grid.js';

import { classList } from '../../lib/string-utils';

const solverURL = "https://github.com/SudokuMonster/SukakuExplainer/";


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
            <div className="hint-text" dangerouslySetInnerHTML={{ __html: hint.html }} />
        </div>
    );
}

export default function ModalHint({modalState, modalHandler, menuHandler}) {
    const {loading, loadingFailed, errorMessage, hint} = modalState;

    const modalClasses = classList(
        "modal hint",
        loading && "loading",
    );
    const closeHandler = () => modalHandler('cancel');
    const candidatesHandler = () => {
        menuHandler("calculate-candidates");
        modalHandler('cancel');
    };
    const candidatesButton = (hint && hint.needCandidates)
        ? <button onClick={candidatesHandler}>Auto Fill Candidates</button>
        : null;

    let title, modalContent;
    let buttonText = "OK";
    if (loading) {
        title = "Loading hints";
        modalContent = <Spinner />
        buttonText = "Cancel";
    }
    else if (loadingFailed) {
        title = "Failed to load hints";
        modalContent = errorMessage === "Error: 400 Bad Request"
            ? (
                <p>The server was unable to provide hints for this puzzle.</p>
            )
            : (
                <p>An error occurred while requesting hints from the server.
                You may wish to try again later.</p>
            );
        buttonText = "Cancel";
    }
    else if (hint) {
        title = hint.title.replace(/,/g, ',\u200B');
        modalContent = <HintBody hint={hint} />;
    }
    return (
        <div className={modalClasses}>
            <div className="hint-layout">
                <div className="hint-body">
                    <h1>{title}</h1>
                    {modalContent}
                    <div className="buttons">
                        {candidatesButton}
                        <button className="primary" onClick={closeHandler}>{buttonText}</button>
                    </div>
                </div>
                <div className="hint-footer">
                    <span>Hints by: <a target="_blank" rel="noopener noreferrer" href={solverURL}>Sukaku Explainer</a></span>
                </div>
            </div>
        </div>
    );
}
