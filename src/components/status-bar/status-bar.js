import React, { useState, useEffect, useCallback } from 'react';

import './status-bar.css';

function twoDigits (n) {
    return n > 9 ? ('' + n) : ('0' + n);
}

function secondsAsHMS (interval) {
    const seconds = interval % 60;
    const minutes = Math.floor(interval / 60) % 60;
    const minSec = `${twoDigits(minutes)}:${twoDigits(seconds)}`;
    return interval >= 3600
        ? `${Math.floor(interval / 3600)}:${minSec}`
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

    const seconds = Math.floor(((endTime || tickNow) - startTime) / 1000);

    return (
        <span className="elapsed-time">{secondsAsHMS(seconds)}</span>
    );
}

function emailShareURL (initialDigits, startTime, endTime) {
    if (!initialDigits) {
        return null;
    }
    const siteURL = window.location.toString().replace(/\?.*$/, '');
    const subject = 'A Sudoku puzzle for you';
    let timeToBeat = '';
    if (endTime) {
        const seconds = Math.floor((endTime - startTime) / 1000);
        timeToBeat = `Time to beat: ${secondsAsHMS(seconds)}\n\n`;
    }
    const body =
        `Here's a link to a Sudoku puzzle:\n\n` +
        `${siteURL}?s=${initialDigits}\n\n${timeToBeat}\n\n`;
    const params = new URLSearchParams();
    params.set('subject', subject);
    params.set('body', body);
    return `mailto:?${params.toString()}`.replace(/[+]/g, '%20');
}

function MenuButton ({initialDigits, startTime, endTime}) {
    const [hidden, setHidden] = useState(true);
    const classes = ['menu'];
    if (hidden) {
        classes.push('hidden')
    }

    const toggleHandler = useCallback(
        () => setHidden(h => !h),
        [setHidden]
    );

    const emailURL = emailShareURL(initialDigits, startTime, endTime);

    const overlay = hidden
        ? null
        : <div className="overlay" onClick={() => setHidden(true)} />

    return (
        <div className={classes.join(' ')}>
            { overlay }
            <button onClick={toggleHandler}>{'\u2261'}</button>
            <ul>
                <li><a href={emailURL}>Share this puzzle via email</a></li>
                <li><a href="./">Enter a new puzzle</a></li>
            </ul>
        </div>
    )
}


function StatusBar ({startTime, endTime, initialDigits}) {
    const timer = startTime
        ? <ElapsedTime startTime={startTime} endTime={endTime} />
        : null;
    return (
        <div className="status-bar">
            {timer}
            <MenuButton
                initialDigits={initialDigits}
                startTime={startTime}
                endTime={endTime}
            />
        </div>
    );
}

export default StatusBar;
