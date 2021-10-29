import React, { useCallback } from 'react';

import { secondsAsHMS } from '../../lib/string-utils';

import "./solved-puzzle-options.css";


export default function SolvedPuzzleOptions({elapsedTime, menuHandler}) {
    const clickHandler = useCallback(
        e => {
            const menuAction = e.target.dataset.menuAction;
            if (menuAction) {
                e.preventDefault();
                menuHandler(menuAction);
            }
        },
        [menuHandler]
    );
    return (
        <div className="solved-puzzle-options" onClick={clickHandler}>
            <p>Puzzle solved in {secondsAsHMS(elapsedTime)}</p>
            <button data-menu-action="show-share-modal">Share this puzzle</button>
            <button data-menu-action="restart-puzzle">Restart this puzzle</button>
            <a href="./" className="btn">New puzzle</a>
        </div>
    )
}
