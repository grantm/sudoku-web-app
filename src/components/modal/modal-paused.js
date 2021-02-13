import React from 'react';

export default function ModalPaused({modalHandler}) {
    const resumeHandler = () => modalHandler('resume-timer');
    return (
        <div className="modal paused">
            <p>The game is paused</p>
            <div className="buttons">
                <button className="primary" onClick={resumeHandler} autoFocus>Resume</button>
            </div>
        </div>
    )
}
