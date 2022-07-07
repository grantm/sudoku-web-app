import React, { useState, useCallback } from 'react';

import './menu-button.css';


function MenuIcon () {
    return (
        <svg version="1.1" viewBox="0 0 48 48">
            <rect className="stroke" x="12" y="12" width="24" height="4" />
            <rect className="stroke" x="12" y="22" width="24" height="4" />
            <rect className="stroke" x="12" y="32" width="24" height="4" />
        </svg>
    )
}

function MenuButton ({initialDigits, showPencilmarks, menuHandler}) {
    const [hidden, setHidden] = useState(true);

    const classes = ['menu'];
    if (hidden) {
        classes.push('hidden')
    }

    const toggleHandler = useCallback(
        () => setHidden(h => !h),
        []
    );

    const clickHandler = useCallback(
        e => {
            const parent = e.target.parentElement;
            if (parent.classList && parent.classList.contains('disabled-link')) {
                e.preventDefault();
                return;
            }
            const menuAction = e.target.dataset.menuAction;
            if (menuAction) {
                e.preventDefault();
                menuHandler(menuAction);
            }
            setHidden(true);
        },
        [menuHandler]
    );

    const showHidePencilmarks = showPencilmarks ? 'Hide' : 'Show';

    const overlay = hidden
        ? null
        : <div className="overlay" onClick={() => setHidden(true)} />

    const shareLinkClass = initialDigits ? '' : 'disabled-link';

    return (
        <div className={classes.join(' ')}>
            { overlay }
            <button type="button" title="Menu" onClick={toggleHandler}><MenuIcon /></button>
            <ul onClick={clickHandler}>
                <li className={shareLinkClass}>
                    <a href="./" data-menu-action="show-share-modal"
                    >Share this puzzle</a>
                </li>
                <li>
                    <a href="./" data-menu-action="toggle-show-pencilmarks">{showHidePencilmarks} pencil marks</a>
                </li>
                <li>
                    <a href="./" data-menu-action="clear-pencilmarks">Clear all pencil marks</a>
                </li>
                <li className={shareLinkClass}>
                    <a href="./" data-menu-action="calculate-candidates">Auto calculate candidates</a>
                </li>
                <li>
                    <a href="./" data-menu-action="save-screenshot">Save a screenshot</a>
                </li>
                <li className={shareLinkClass}>
                    <a href="./" data-menu-action="show-solver-modal">Open in SudokuWiki.org solver</a>
                </li>
                <li><a href="./">New puzzle</a></li>
                <li>
                    <a href="./" data-menu-action="show-settings-modal">Settings</a>
                </li>
                <li><a href="./" data-menu-action="show-help-page">Help</a></li>
                <li><a href="./" data-menu-action="show-about-modal">About this app</a></li>
            </ul>
        </div>
    )
}

export default MenuButton;
