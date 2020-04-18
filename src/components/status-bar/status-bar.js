import React from 'react';

import TimerWithPause from '../timer-with-pause/timer-with-pause';
import MenuButton from '../menu-button/menu-button';
import FullscreenButton from '../fullscreen-button/fullscreen-button';


import './status-bar.css';

const stopPropagation = (e) => e.stopPropagation();


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
