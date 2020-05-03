import React, { useState, useCallback } from 'react';

import './menu-button.css';


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

function MenuButton ({initialDigits, startTime, endTime, menuHandler}) {
    const [hidden, setHidden] = useState(true);

    const classes = ['menu'];
    if (hidden) {
        classes.push('hidden')
    }

    const toggleHandler = useCallback(
        () => setHidden(h => !h),
        []
    );

    const shareHandler = useCallback(
        e => {
            e.preventDefault();
            menuHandler('show-share-modal');
            setHidden(true);
        },
        [menuHandler]
    );

    const settingsHandler = useCallback(
        e => {
            e.preventDefault();
            menuHandler('show-settings-modal');
            setHidden(true);
        },
        [menuHandler]
    );

    const clearPencilmarksHandler = useCallback(
        e => {
            e.preventDefault();
            menuHandler('clear-pencilmarks');
            setHidden(true);
        },
        [menuHandler]
    );

    const helpHandler = useCallback(
        e => {
            e.preventDefault();
            menuHandler('show-help-page');
            setHidden(true);
        },
        [menuHandler]
    );

    const aboutHandler = useCallback(
        e => {
            e.preventDefault();
            menuHandler('show-about-modal');
            setHidden(true);
        },
        [menuHandler]
    );

    const overlay = hidden
        ? null
        : <div className="overlay" onClick={() => setHidden(true)} />

    return (
        <div className={classes.join(' ')}>
            { overlay }
            <button type="button" title="Menu" onClick={toggleHandler}><MenuIcon /></button>
            <ul onMouseUp={() => setHidden(true)}>
                <li>
                    <a href="./" onClick={shareHandler}
                    >Share this puzzle</a>
                </li>
                <li>
                    <a href="./" onClick={clearPencilmarksHandler}
                    >Clear all pencilmarks</a>
                </li>
                <li>
                    <a href={`https://www.sudokuwiki.org/sudoku.htm?bd=${initialDigits}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >Open in Sudokuwiki.org solver</a>
                </li>
                <li><a href="./">Enter a new puzzle</a></li>
                <li>
                    <a href="./" onClick={settingsHandler}
                    >Settings</a>
                </li>
                <li><a href="./" onClick={helpHandler}>Help</a></li>
                <li><a href="./" onClick={aboutHandler}>About this app</a></li>
            </ul>
        </div>
    )
}

export default MenuButton;
