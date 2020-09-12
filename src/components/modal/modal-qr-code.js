import React from 'react';
import QRCode from 'qrcode.react';

import { puzzleURL } from '../../lib/url-utils';

export default function ModalQRCode({modalHandler, modalState}) {
    const {initialDigits, difficultyLevel} = modalState;

    const closeHandler = () => modalHandler('cancel');
    const backHandler = () => modalHandler('show-share-modal');

    const thisURL = puzzleURL(initialDigits, difficultyLevel);

    return (
        <div className="modal qr">
            <QRCode value={thisURL} />
            <div className="buttons">
                <button onClick={backHandler}>Back</button>
                <button onClick={closeHandler}>Close</button>
            </div>
        </div>
    )
}
