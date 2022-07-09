import QRCode from 'qrcode.react';

export default function ModalQRCode({modalHandler, modalState}) {
    const {puzzleURL} = modalState;

    const closeHandler = () => modalHandler('cancel');
    const backHandler = () => modalHandler('show-share-modal');

    return (
        <div className="modal qr">
            <QRCode value={puzzleURL} renderAs="svg" includeMargin={true} size={320} />
            <div className="buttons">
                <button onClick={backHandler} autoFocus>Back</button>
                <button onClick={closeHandler}>Close</button>
            </div>
        </div>
    )
}
