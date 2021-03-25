import React from 'react';

import Spinner from '../spinner/spinner';
import SudokuHintGrid from '../sudoku-grid/sudoku-hint-grid.js';


function HintBody({hint}) {
    const digits = hint.digits;
    const candidates = hint.candidates;

    return (
        <div className="hint-layout">
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
    const {loading, loadingFailed, hint} = modalState;

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
        modalContent = (
            <p>An error occurred while requesting hints from the server.
            You may wish to try again later.</p>
        )
        buttonText = "Cancel";
    }
    else if (hint) {
        title = hint.title;
        modalContent = <HintBody hint={hint} />;
    }
    return (
        <div className="modal hint">
            <h1>{title}</h1>
            {modalContent}
            <div className="buttons">
                {candidatesButton}
                <button className="primary" onClick={closeHandler}>{buttonText}</button>
            </div>
        </div>
    );
}
