import React from 'react';

import "./modal.css";

function ModalBackdrop() {
        return (
            <div className="modal-backdrop" />
        );
}

function ModalConfirmRestart({modalHandler}) {
    return (
        <div className="modal confirm-restart">
            <h1>Restart the puzzle?</h1>
            <p>Are you sure you wish to discard all the numbers and pencil-marks
            you've entered?</p>
            <div className="buttons">
            <button className="cancel"
                onClick={() => modalHandler('cancel')}
            >Cancel</button>
            <button className="danger"
                onClick={() => modalHandler('restart-confirmed')}
            >Restart</button>
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
    else {
        console.log('<Modal />: Unhandled modalState:', modalState);
    }
    if (content) {
        return <>
            <ModalBackdrop />
            <div className="modal-container">
                {content}
            </div>
        </>;
    };
    return null;
}
