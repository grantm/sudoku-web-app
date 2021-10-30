import React, { useState, useEffect } from 'react';

import { secondsAsHMS } from '../../lib/string-utils';

import './timer-with-pause.css';


function ElapsedTime ({intervalStartTime, endTime, pausedAt}) {
    const [tickNow, setTickNow] = useState(Date.now());

    useEffect(() => {
        if (!endTime) {
            const timer = setTimeout(() => {
                setTickNow(Date.now());
            }, 1001 - (Date.now() % 1000));
            return () => { clearTimeout(timer); }
        }
    });

    const seconds = Math.floor(((endTime || pausedAt || tickNow) - intervalStartTime) / 1000);

    return (
        <span className="elapsed-time">{secondsAsHMS(seconds)}</span>
    );
}

function PauseIcon () {
    return (
        <svg version="1.1"
            baseProfile="full"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect className="stroke" x="15" y="12" width="6" height="24" />
            <rect className="stroke" x="27" y="12" width="6" height="24" />
        </svg>
    )
}

function TimerWithPause({startTime, intervalStartTime, endTime, pausedAt, pauseHandler, hintsUsedCount}) {
    if (!startTime) {
        return null;
    }
    const hintCount = hintsUsedCount > 0
        ? (
            <span
                className="hints-used"
                title={`${hintsUsedCount} hint${hintsUsedCount === 1 ? "" : "s"} used`}
            >{hintsUsedCount}</span>
        )
        : null;
    return <div id="timer">
        <ElapsedTime intervalStartTime={intervalStartTime} endTime={endTime} pausedAt={pausedAt} />
        {hintCount}
        <button id="pause-btn" title="Pause timer" onClick={pauseHandler}>
            <PauseIcon />
        </button>
    </div>;
}

export default TimerWithPause;
