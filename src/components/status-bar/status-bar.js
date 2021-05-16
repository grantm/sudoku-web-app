import React from 'react';

import TimerWithPause from '../timer-with-pause/timer-with-pause';
import MenuButton from '../menu-button/menu-button';
import SettingsButton from '../settings-button/settings-button';
import HintButton from '../hint-button/hint-button';
import FullscreenButton from '../fullscreen-button/fullscreen-button';

import SiteDomainImg from '../../assets/site-domain.svg';


import './status-bar.css';

const stopPropagation = (e) => e.stopPropagation();


function SiteLink () {
    return (
        <div className="site-link">
            <a href="https://sudokuexchange.com/"><img src={SiteDomainImg}
                alt="SudokuExchange.com" /></a>
        </div>
    );
}


function StatusBar ({showTimer, startTime, endTime, pausedAt, showHints, showPencilmarks, menuHandler, pauseHandler, initialDigits}) {
    const timer = showTimer
        ? (
            <TimerWithPause
                startTime={startTime}
                endTime={endTime}
                pausedAt={pausedAt}
                pauseHandler={pauseHandler}
            />
        )
        : null;
    return (
        <div className="status-bar" onMouseDown={stopPropagation}>
            <SiteLink />
            {timer}
            <div className="status-bar-buttons">
                <FullscreenButton />
                {
                    showHints
                        ? <HintButton menuHandler={menuHandler} />
                        : null
                }
                <SettingsButton menuHandler={menuHandler} />
                <MenuButton
                    initialDigits={initialDigits}
                    startTime={startTime}
                    endTime={endTime}
                    showPencilmarks={showPencilmarks}
                    menuHandler={menuHandler}
                />
            </div>
        </div>
    );
}

export default StatusBar;
