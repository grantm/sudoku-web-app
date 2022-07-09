import { useState, useEffect } from 'react';

import { secondsAsHMS } from '../../lib/string-utils';

import './timer-with-pause.css';

import ButtonIcon from '../svg-sprites/button-icon';

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
        <button id="pause-btn" type="button" title="Pause timer" onClick={pauseHandler}>
            <ButtonIcon name="pause" />
        </button>
    </div>;
}

export default TimerWithPause;
