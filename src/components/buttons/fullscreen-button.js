import React, { useState, useEffect } from 'react';

function EnterFullscreenIcon () {
    return (
        <svg version="1.1" viewBox="0 0 48 48">
            <rect className="stroke" x="8" y="8" width="12" height="4" />
            <rect className="stroke" x="8" y="8" width="4" height="12" />
            <rect className="stroke" x="28" y="8" width="12" height="4" />
            <rect className="stroke" x="36" y="8" width="4" height="12" />
            <rect className="stroke" x="8" y="28" width="4" height="12" />
            <rect className="stroke" x="8" y="36" width="12" height="4" />
            <rect className="stroke" x="28" y="36" width="12" height="4" />
            <rect className="stroke" x="36" y="28" width="4" height="12" />
        </svg>
    )
}

function ExitFullscreenIcon () {
    return (
        <svg version="1.1" viewBox="0 0 48 48">
            <rect className="stroke" x="8"  y="16" width="12" height="4" />
            <rect className="stroke" x="16" y="8"  width="4" height="12" />
            <rect className="stroke" x="28" y="16" width="12" height="4" />
            <rect className="stroke" x="28" y="8"  width="4" height="12" />
            <rect className="stroke" x="16" y="28" width="4" height="12" />
            <rect className="stroke" x="8"  y="28" width="12" height="4" />
            <rect className="stroke" x="28" y="28" width="12" height="4" />
            <rect className="stroke" x="28" y="28" width="4" height="12" />
        </svg>
    )
}

function FullscreenButton () {
    const [fsEnabled, setFsEnabled] = useState(window.document.fullscreen);
    const content = fsEnabled ? <ExitFullscreenIcon /> : <EnterFullscreenIcon />;
    const title = fsEnabled ? 'Exit full screen' : 'Full screen';
    const clickHandler = (e) => {
        e.currentTarget.blur();
        return window.document.fullscreen
            ? window.document.exitFullscreen()
            : window.document.body.requestFullscreen();
    };
    useEffect(
        () => {
            const resizeHandler = (e) => { setFsEnabled(window.document.fullscreen); };
            window.addEventListener('fullscreenchange', resizeHandler);
            return () => {
                window.removeEventListener('fullscreenchange', resizeHandler);
            }
        },
        [setFsEnabled]
    );
    return (
        <button id="fullscreen-button" type="button" title={title} onClick={clickHandler}>
            {content}
        </button>
    );
}

export default FullscreenButton;
