import React from 'react';

import ModalConfirmRestart from './modal-confirm-restart';
import ModalConfirmClearColorHighlights from './modal-confirm-clear-color-highlights'
import ModalCheckResult from './modal-check-result';
import ModalPaused from './modal-paused';

import "./modal.css";

const stopPropagation = (e) => e.stopPropagation();

function ModalBackdrop() {
    return (
        <div className="modal-backdrop" />
    );
}

export default function ModalContainer({modalState, modalHandler}) {
    let content = null;
    if (!modalState) {
        return null;
    }
    if (modalState.modalType === 'confirm-restart') {
        content = <ModalConfirmRestart modalHandler={modalHandler} />;
    }
    else if (modalState.modalType === 'confirm-clear-color-highlights') {
        content = <ModalConfirmClearColorHighlights modalHandler={modalHandler} />;
    }
    else if (modalState.modalType === 'check-result') {
        content = <ModalCheckResult modalState={modalState} modalHandler={modalHandler} />;
    }
    else if (modalState.modalType === 'paused') {
        content = <ModalPaused modalState={modalState} modalHandler={modalHandler} />;
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
