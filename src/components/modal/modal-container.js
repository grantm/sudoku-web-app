import React from 'react';

import "./modal.css";

const stopPropagation = (e) => e.stopPropagation();

function ModalBackdrop() {
    return (
        <div className="modal-backdrop" />
    );
}

function ModalConfirmRestart({modalHandler}) {
    const cancelHandler = () => modalHandler('cancel');
    const restartHandler = () => modalHandler('restart');
    return (
        <div className="modal confirm-restart">
            <h1>Restart the puzzle?</h1>
            <p>Are you sure you wish to discard all the numbers and pencil-marks
            you've entered?</p>
            <div className="buttons">
                <button className="cancel" onClick={cancelHandler}>Cancel</button>
                <button className="danger" onClick={restartHandler}>Restart</button>
            </div>
        </div>
    )
}

function ModalCheckResult({modalState, modalHandler}) {
    const result = modalState.result;
    const cancelHandler = () => modalHandler('cancel');
    return (
        <div className="modal confirm-restart">
            <p>{result.errorMessage}</p>
            <div className="buttons">
            <button className="cancel" onClick={cancelHandler}>OK</button>
            </div>
        </div>
    )
}

export default function ModalContainer({modalState, modalHandler}) {
    let content = null;
    if (!modalState) {
        return null;
    }
    if (modalState.modalType === 'confirm-restart') {
        content = <ModalConfirmRestart modalHandler={modalHandler} />;
    }
    else if (modalState.modalType === 'check-result') {
        content = <ModalCheckResult modalState={modalState} modalHandler={modalHandler} />;
    }
    else {
        console.log('<Modal />: Unhandled modalState:', modalState);
    }
    if (content) {
        return <>
            <ModalBackdrop />
            <div className="modal-container" onMouseDown={stopPropagation}>
                {content}
            </div>
        </>;
    };
    return null;
}
