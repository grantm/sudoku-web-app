import ModalIcon from './modal-icon';

export default function ModalCheckResult({modalState, modalHandler}) {
    const errorMessage = modalState.errorMessage;
    const cancelHandler = () => modalHandler('cancel');
    const icon = modalState.icon
        ? <span className={`icon check-result-${modalState.icon}`}><ModalIcon icon={modalState.icon} /></span>
        : null;
    return (
        <div className="modal check-result">
            <div className="icon-message">
                {icon}
                <div className="message">{errorMessage}</div>
            </div>
            <div className="buttons">
                <button className="primary" onClick={cancelHandler} autoFocus>OK</button>
            </div>
        </div>
    )
}
