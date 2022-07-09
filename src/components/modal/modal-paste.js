import { useState } from 'react';

import { expandPuzzleDigits } from '../../lib/string-utils';


export default function ModalPaste({modalHandler}) {
    const [newDigits, setNewDigits] = useState('');

    const inputHandler = (e) => {
        let text = e.target.value;
        const match = text.replace(/\s+/gs, '').replace(/[_.-]/g, '0').match(/^(\d{81}|[0-9a-zA-Z]{13,81})$/);
        text = match ? match[1] : text;
        if(text.match(/^[0-9a-zA-Z]+$/)) {
            text = expandPuzzleDigits(text);
        }
        setNewDigits(text);
    };
    const haveValidDigits = newDigits.match(/^\d{81}$/);
    const submitClass = haveValidDigits ? 'primary' : null;
    const cancelHandler = () => modalHandler('cancel-paste');
    const pasteHandler = () => {
        if (haveValidDigits) {
            modalHandler({
                action: 'paste-initial-digits',
                digits: newDigits,
            });
        }
    }
    return (
        <div className="modal paste">
            <h1>Paste a puzzle</h1>
            <p>Paste a string of 81 digits below:</p>
            <textarea value={newDigits} onChange={inputHandler} autoFocus />
            <div className="buttons">
                <button className="cancel" onClick={cancelHandler}>Cancel</button>
                <button className={submitClass} onClick={pasteHandler} disabled={!haveValidDigits}>Start</button>
            </div>
        </div>
    );
}
