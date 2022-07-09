import {
    MODAL_TYPE_WELCOME,
    MODAL_TYPE_SAVED_PUZZLES,
    MODAL_TYPE_RESUME_OR_RESTART,
    MODAL_TYPE_INVALID_INITIAL_DIGITS,
    MODAL_TYPE_PASTE,
    MODAL_TYPE_SHARE,
    MODAL_TYPE_SETTINGS,
    MODAL_TYPE_CHECK_RESULT,
    MODAL_TYPE_PAUSED,
    MODAL_TYPE_CONFIRM_RESTART,
    MODAL_TYPE_CONFIRM_CLEAR_COLOR_HIGHLIGHTS,
    MODAL_TYPE_SOLVER,
    MODAL_TYPE_HELP,
    MODAL_TYPE_HINT,
    MODAL_TYPE_ABOUT,
    MODAL_TYPE_QR_CODE,
    MODAL_TYPE_FEATURES,
} from '../../lib/modal-types';


import ModalWelcome from './modal-welcome';
import ModalSavedPuzzles from './modal-saved-puzzles';
import ModalResumeRestart from './modal-resume-or-restart';
import ModalInvalidInitialDigits from './modal-invalid-initial-digits';
import ModalAbout from './modal-about';
import ModalConfirmRestart from './modal-confirm-restart';
import ModalConfirmClearColorHighlights from './modal-confirm-clear-color-highlights'
import ModalCheckResult from './modal-check-result';
import ModalPaused from './modal-paused';
import ModalPaste from './modal-paste';
import ModalShare from './modal-share';
import ModalSolver from './modal-solver';
import ModalSettings from './modal-settings';
import ModalQRCode from './modal-qr-code';
import ModalHint from './modal-hint';
import ModalFeatures from './modal-features';
import HelpPage from '../help/help';

import "./modal.css";

const stopPropagation = (e) => e.stopPropagation();

function ModalBackdrop() {
    return (
        <div className="modal-backdrop" />
    );
}

export default function ModalContainer({modalState, modalHandler, menuHandler}) {
    let content = null;
    if (!modalState) {
        return null;
    }
    const containerClickHandler = (e) => {
        if (e.target === e.currentTarget) {
            if (modalState.escapeAction) {
                modalHandler(modalState.escapeAction);
            }
        }
    }
    if (modalState.modalType === MODAL_TYPE_WELCOME) {
        content = <ModalWelcome modalState={modalState} modalHandler={modalHandler} />;
    }
    else if (modalState.modalType === MODAL_TYPE_SAVED_PUZZLES) {
        content = <ModalSavedPuzzles modalState={modalState} modalHandler={modalHandler} />;
    }
    else if (modalState.modalType === MODAL_TYPE_RESUME_OR_RESTART) {
        content = <ModalResumeRestart modalState={modalState} modalHandler={modalHandler} />;
    }
    else if (modalState.modalType === MODAL_TYPE_INVALID_INITIAL_DIGITS) {
        content = <ModalInvalidInitialDigits modalState={modalState} modalHandler={modalHandler} />;
    }
    else if (modalState.modalType === MODAL_TYPE_PASTE) {
        content = <ModalPaste modalHandler={modalHandler} />;
    }
    else if (modalState.modalType === MODAL_TYPE_ABOUT) {
        content = <ModalAbout modalHandler={modalHandler} />;
    }
    else if (modalState.modalType === MODAL_TYPE_SHARE) {
        content = <ModalShare modalState={modalState} modalHandler={modalHandler} menuHandler={menuHandler} />;
    }
    else if (modalState.modalType === MODAL_TYPE_SETTINGS) {
        content = <ModalSettings modalState={modalState} modalHandler={modalHandler} />;
    }
    else if (modalState.modalType === MODAL_TYPE_CONFIRM_RESTART) {
        content = <ModalConfirmRestart modalHandler={modalHandler} solved={modalState.solved} />;
    }
    else if (modalState.modalType === MODAL_TYPE_CONFIRM_CLEAR_COLOR_HIGHLIGHTS) {
        content = <ModalConfirmClearColorHighlights modalHandler={modalHandler} />;
    }
    else if (modalState.modalType === MODAL_TYPE_CHECK_RESULT) {
        content = <ModalCheckResult modalState={modalState} modalHandler={modalHandler} />;
    }
    else if (modalState.modalType === MODAL_TYPE_PAUSED) {
        content = <ModalPaused modalState={modalState} modalHandler={modalHandler} />;
    }
    else if (modalState.modalType === MODAL_TYPE_SOLVER) {
        content = <ModalSolver modalState={modalState} modalHandler={modalHandler} />;
    }
    else if (modalState.modalType === MODAL_TYPE_HINT) {
        content = <ModalHint modalState={modalState} modalHandler={modalHandler} menuHandler={menuHandler} />;
    }
    else if (modalState.modalType === MODAL_TYPE_HELP) {
        content = <HelpPage modalHandler={modalHandler} />;
    }
    else if (modalState.modalType === MODAL_TYPE_QR_CODE) {
        content = <ModalQRCode modalState={modalState} modalHandler={modalHandler} />;
    }
    else if (modalState.modalType === MODAL_TYPE_FEATURES) {
        content = <ModalFeatures modalState={modalState} modalHandler={modalHandler} />;
    }
    else {
        console.log('<Modal />: Unhandled modalState:', modalState);
    }
    if (content) {
        return <>
            <ModalBackdrop />
            <div className="modal-container" onClick={containerClickHandler} onMouseDown={stopPropagation}>
                {content}
            </div>
        </>;
    };
    return null;
}
