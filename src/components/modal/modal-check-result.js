import React from 'react';

export default function ModalCheckResult({modalState, modalHandler}) {
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
