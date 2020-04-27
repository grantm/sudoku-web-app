import React from 'react';

export default function ModalCheckResult({modalState, modalHandler}) {
    const errorMessage = modalState.errorMessage;
    const cancelHandler = () => modalHandler('cancel');
    const warning = modalState.warning ? (<h1>Warning</h1>) : null;
    return (
        <div className="modal confirm-restart">
            {warning}
            <p>{errorMessage}</p>
            <div className="buttons">
            <button className="cancel" onClick={cancelHandler}>OK</button>
            </div>
        </div>
    )
}
