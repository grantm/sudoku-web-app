import React from 'react';

import TimerWithPause from '../timer-with-pause/timer-with-pause';
import MenuButton from '../buttons/menu-button';
import SettingsButton from '../buttons/settings-button';
import HintButton from '../buttons/hint-button';
import FullscreenButton from '../buttons/fullscreen-button';


import './status-bar.css';

const stopPropagation = (e) => e.stopPropagation();


function SiteLink () {
    return (
        <div className="site-link">
            <a href="https://sudokuexchange.com/">
                <svg className="site-domain-image" version="1.1" viewBox="0 0 650 120" title="SudokuExchange.com">
                    <use href="#site-domain" />
                </svg>
            </a>
        </div>
    );
}

function StatusBar ({
    showTimer, startTime, intervalStartTime, endTime, pausedAt, hintsUsedCount,
    showPencilmarks, menuHandler, pauseHandler, initialDigits
}) {
    const timer = showTimer
        ? (
            <TimerWithPause
                startTime={startTime}
                intervalStartTime={intervalStartTime}
                endTime={endTime}
                pausedAt={pausedAt}
                pauseHandler={pauseHandler}
                hintsUsedCount={hintsUsedCount}
            />
        )
        : null;
    return (
        <div className="status-bar" onMouseDown={stopPropagation}>
            <SiteLink />
            {timer}
            <div className="status-bar-buttons">
                <FullscreenButton />
                <HintButton menuHandler={menuHandler} />
                <SettingsButton menuHandler={menuHandler} />
                <MenuButton
                    initialDigits={initialDigits}
                    showPencilmarks={showPencilmarks}
                    menuHandler={menuHandler}
                />
            </div>
        </div>
    );
}

export default StatusBar;
