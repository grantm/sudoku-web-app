import React, { useState } from 'react';


function ModalInsufficientInitialDigits({modalHandler}) {
    const [linkText, setLinkText] = useState('');

    const inputHandler = (e) => {
        const text = e.target.value;
        let match = text.replace(/\s+/gs, '').match(/s=(\d{81})/);
        setLinkText(match ? match[1] : text);
    };
    const haveValidDigits = linkText.match(/^\d{81}$/);
    const submitClass = haveValidDigits ? 'primary' : null;
    const cancelHandler = () => modalHandler('cancel');
    const retryHandler = () => {
        if (haveValidDigits) {
            modalHandler({
                action: 'retry-initial-digits',
                digits: linkText,
            });
        }
    }
    return (
        <div className="modal invalid-initial-digits">
            <h1>Missing digits</h1>
            <p>You clicked a link that was missing some of the expected 81 digits.
            If the link was split over multiple lines in an email, you can try
            pasting all the lines below.<br />
            Or press "Cancel" to enter digits directly into the grid.</p>
            <textarea value={linkText} onChange={inputHandler} />
            <div className="buttons">
                <button className="cancel" onClick={cancelHandler}>Cancel</button>
                <button className={submitClass} onClick={retryHandler}>Try again</button>
            </div>
        </div>
    );
}


function ModalConflictingInitialDigits({modalHandler}) {
    const cancelHandler = () => modalHandler('cancel');
    return (
        <div className="modal invalid-initial-digits">
            <h1>Invalid starting digits</h1>
            <p>The link you clicked contains invalid starting digits.
            If you are able to correct the highlighted errors, you can use the
            {' '}<strong>Start</strong> button to begin solving.</p>
            <div className="buttons">
                <button className="cancel" onClick={cancelHandler}>OK</button>
            </div>
        </div>
    );
}


export default function ModalInvalidInitialDigits({modalHandler, modalState}) {
    if (modalState.insufficientDigits) {
        return <ModalInsufficientInitialDigits modalHandler={modalHandler} />;
    }
    else {
        return <ModalConflictingInitialDigits modalHandler={modalHandler} />;
    }
}
