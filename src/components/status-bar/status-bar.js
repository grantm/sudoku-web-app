import React, { useState, useEffect } from 'react';

import './status-bar.css';

function twoDigits (n) {
    return n > 9 ? ('' + n) : ('0' + n);
}

function timeAsHMS (startTime, now) {
    const elapsed = Math.floor((now - startTime) / 1000);
    const seconds = elapsed % 60;
    const minutes = Math.floor(elapsed / 60) % 60;
    const minSec = `${twoDigits(minutes)}:${twoDigits(seconds)}`;
    return elapsed >= 3600
        ? `${Math.floor(elapsed / 3600)}:${minSec}`
        : minSec;
}


function ElapsedTime ({startTime, endTime}) {
    const [tickNow, setTickNow] = useState(Date.now());

    useEffect(() => {
        if (!endTime) {
            const timer = setTimeout(() => {
                setTickNow(Date.now());
            }, 1001 - (Date.now() % 1000));
            return () => { clearTimeout(timer); }
        }
    });

    return (
        <span className="elapsed-time">{timeAsHMS(startTime, endTime || tickNow)}</span>
    );
}


function StatusBar ({startTime, endTime}) {
    const timer = startTime
        ? <ElapsedTime startTime={startTime} endTime={endTime} />
        : null;
    return (
        <div className="status-bar">
            {timer}
        </div>
    );
}

export default StatusBar;
