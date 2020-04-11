import React, { useState, useEffect, useCallback } from 'react';

import FullscreenButton from '../fullscreen-button/fullscreen-button';

import './status-bar.css';

const stopPropagation = (e) => e.stopPropagation();

function twoDigits (n) {
    return n > 9 ? ('' + n) : ('0' + n);
}

function secondsAsHMS (interval) {
    interval = Math.max(interval, 0);
    const seconds = interval % 60;
    const minutes = Math.floor(interval / 60) % 60;
    const minSec = `${twoDigits(minutes)}:${twoDigits(seconds)}`;
    return interval >= 3600
        ? `${Math.floor(interval / 3600)}:${minSec}`
        : minSec;
}


function ElapsedTime ({startTime, endTime, pausedAt}) {
    const [tickNow, setTickNow] = useState(Date.now());

    useEffect(() => {
        if (!endTime) {
            const timer = setTimeout(() => {
                setTickNow(Date.now());
            }, 1001 - (Date.now() % 1000));
            return () => { clearTimeout(timer); }
        }
    });

    const seconds = Math.floor(((endTime || pausedAt || tickNow) - startTime) / 1000);

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

function MenuIcon () {
    return (
        <svg version="1.1"
            baseProfile="full"
            viewBox="0 0 48 48"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect className="stroke" x="12" y="12" width="24" height="4" />
            <rect className="stroke" x="12" y="22" width="24" height="4" />
            <rect className="stroke" x="12" y="32" width="24" height="4" />
        </svg>
    )
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

function MenuButton ({initialDigits, startTime, endTime, menuHandler}) {
    const [hidden, setHidden] = useState(true);
    const [darkModeEnabled, setDarkModeEnabled] = useState(false);

    const classes = ['menu'];
    if (hidden) {
        classes.push('hidden')
    }

    const toggleHandler = useCallback(
        () => setHidden(h => !h),
        []
    );

    const darkModeHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (darkModeEnabled) {
            window.document.body.classList.remove('dark');
        }
        else {
            window.document.body.classList.add('dark');
        }
        setDarkModeEnabled(!darkModeEnabled);
    };
    const darkModeOptionText = darkModeEnabled
        ? 'Turn off dark mode'
        : 'Turn on dark mode';

    const clearPencilmarksHandler = useCallback(
        e => {
            e.preventDefault();
            menuHandler('clear-pencilmarks');
            setHidden(true);
        },
        [menuHandler]
    );

    const emailURL = emailShareURL(initialDigits, startTime, endTime);

    const overlay = hidden
        ? null
        : <div className="overlay" onClick={() => setHidden(true)} />

    return (
        <div className={classes.join(' ')}>
            { overlay }
            <button type="button" title="Menu" onClick={toggleHandler}><MenuIcon /></button>
            <ul onMouseUp={() => setHidden(true)}>
                <li>
                    <a href="./" onClick={darkModeHandler}
                    >{darkModeOptionText}</a>
                </li>
                <li>
                    <a href="./" onClick={clearPencilmarksHandler}
                    >Clear all pencilmarks</a>
                </li>
                <li><a href={emailURL}>Share this puzzle via email</a></li>
                <li>
                    <a href={`https://www.sudokuwiki.org/sudoku.htm?bd=${initialDigits}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >Open in Sudokuwiki.org solver</a>
                </li>
                <li><a href="./">Enter a new puzzle</a></li>
            </ul>
        </div>
    )
}

function TimerWithPause({startTime, endTime, pausedAt, pauseHandler}) {
    if (!startTime) {
        return null;
    }
    return <div id="timer">
        <ElapsedTime startTime={startTime} endTime={endTime} pausedAt={pausedAt} />
        <button id="pause-btn" title="Pause timer" onClick={pauseHandler}>
            <PauseIcon />
        </button>
    </div>;
}

function StatusBar ({startTime, endTime, pausedAt, menuHandler, pauseHandler, initialDigits}) {
    return (
        <div className="status-bar" onMouseDown={stopPropagation}>
            <TimerWithPause
                startTime={startTime}
                endTime={endTime}
                pausedAt={pausedAt}
                pauseHandler={pauseHandler}
            />
            <FullscreenButton />
            <MenuButton
                initialDigits={initialDigits}
                startTime={startTime}
                endTime={endTime}
                menuHandler={menuHandler}
            />
        </div>
    );
}

export default StatusBar;
