import React, { useCallback } from 'react';

import { secondsAsHMS } from '../../lib/string-utils';

import "./solved-puzzle-options.css";


export default function SolvedPuzzleOptions({elapsedTime, hintsUsedCount, menuHandler}) {
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
    const hintCount = hintsUsedCount > 0
        ? (
            <span className="hints-used-final"><br />
                with {`${hintsUsedCount} hint${hintsUsedCount === 1 ? "" : "s"} used`}
            </span>
        )
        : null;
    return (
        <div className="solved-puzzle-options" onClick={clickHandler}>
            <p>Puzzle solved in {secondsAsHMS(elapsedTime)}{hintCount}</p>
            <button data-menu-action="show-share-modal">Share this puzzle</button>
            <button data-menu-action="restart-puzzle">Restart this puzzle</button>
            <a href="./" className="btn">New puzzle</a>
        </div>
    )
}
