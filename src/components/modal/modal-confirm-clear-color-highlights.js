export default function ModalConfirmClearColorHighlights({modalHandler}) {
    const cancelHandler = () => modalHandler('cancel');
    const restartHandler = () => modalHandler('clear-color-highlights-confirmed');
    return (
        <div className="modal confirm-restart">
            <h1>Clear all colour highlighting?</h1>
            <p>Are you sure you wish to remove the colour highlighting from all cells?</p>
            <div className="buttons">
                <button className="cancel" onClick={cancelHandler}>Cancel</button>
                <button className="danger" onClick={restartHandler} autoFocus>OK</button>
            </div>
        </div>
    )
}
