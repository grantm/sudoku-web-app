import React, { useState, useEffect } from 'react';

function EnterFullscreenIcon () {
    return (
        <svg version="1.1"
            baseProfile="full"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
        >
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
        <svg version="1.1"
            baseProfile="full"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
        >
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
    const clickHandler = () => {
        return window.document.fullscreen
            ? window.document.exitFullscreen()
            : window.document.body.requestFullscreen();
    };
    const resizeHandler = (e) => { setFsEnabled(window.document.fullscreen); };
    useEffect(
        () => {
            window.addEventListener('fullscreenchange', resizeHandler);
            return () => {
                window.removeEventListener('fullscreenchange', resizeHandler);
            }
        },
        [resizeHandler]
    );
    return (
        <button id="fullscreen-button" type="button" title={title} onClick={clickHandler}>
            {content}
        </button>
    );
}

export default FullscreenButton;
