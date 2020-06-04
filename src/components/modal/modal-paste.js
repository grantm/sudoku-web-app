import React, { useState } from 'react';


export default function ModalPaste({modalHandler}) {
    const [newDigits, setNewDigits] = useState('');

    const inputHandler = (e) => {
        const text = e.target.value;
        let match = text.replace(/\s+/gs, '').replace(/[_.-]/g, '0').match(/^(\d{81})$/);
        setNewDigits(match ? match[1] : text);
    };
    const haveValidDigits = newDigits.match(/^\d{81}$/);
    const submitClass = haveValidDigits ? 'primary' : null;
    const cancelHandler = () => modalHandler('cancel');
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
            <textarea value={newDigits} onChange={inputHandler} />
            <div className="buttons">
                <button className="cancel" onClick={cancelHandler}>Cancel</button>
                <button className={submitClass} onClick={pasteHandler} disabled={!haveValidDigits}>Start</button>
            </div>
        </div>
    );
}
