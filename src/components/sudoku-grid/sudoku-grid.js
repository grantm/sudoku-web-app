import React, { useState } from 'react';

import './sudoku-grid.css';

import SudokuCell from './sudoku-cell';
import GridLines from './grid-lines.js';


function indexFromTouchEvent (e) {
    const t = (e.touches || {})[0];
    if (t) {
        let index = t.target.dataset.cellIndex;
        if (t.pageX) {
            const el = document.elementFromPoint(t.pageX, t.pageY);
            if (el && el !== t.target) {
                index = el.dataset.cellIndex;
            }
        }
        if (index !== undefined) {
            return parseInt(index, 10);
        }
    }
    return;
}

function useCellTouch (touchHandler) {
    const [lastCellTouched, setLastCellTouched] = useState(false);
    return (e) => {
        e.preventDefault();
        e.stopPropagation();
        const eventType = e.type;
        if (eventType === 'touchend') {
            setLastCellTouched(undefined);
            return
        }
        const cellIndex = indexFromTouchEvent(e);
        if (cellIndex !== undefined && cellIndex !== lastCellTouched) {
            if (eventType === 'touchstart') {
                touchHandler({type: 'cellTouched', cellIndex});
            }
            else if (eventType === 'touchmove') {
                touchHandler({type: 'cellSwipedTo', cellIndex});
            }
            setLastCellTouched(cellIndex);
            // console.log(`${eventType} event on cell #${cellIndex}`);
        }
    };
}


function SudokuGrid({grid, dimensions, isPaused, mouseDownHandler, mouseOverHandler, touchHandler}) {
    const matchDigit = grid.get('matchDigit');
    const rawTouchHandler = useCellTouch(touchHandler);
    const cellContents = grid.get('cells').toArray().map((c) => {
        return (
            <SudokuCell
                key={c.get('location')}
                cell={c}
                matchDigit={matchDigit}
                isPaused={isPaused}
                mouseDownHandler={mouseDownHandler}
                mouseOverHandler={mouseOverHandler}
                touchHandler={touchHandler}
            />
        )
    });
    return (
        <div className="sudoku-grid"
            onTouchStart={rawTouchHandler}
            onTouchEnd={rawTouchHandler}
            onTouchMove={rawTouchHandler}
        >
            <svg version="1.1"
                style={{width: dimensions.gridLength}}
                baseProfile="full"
                viewBox="0 0 1000 1000"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect className="grid-bg" width="100%" height="100%" />
                {cellContents}
                <GridLines />
            </svg>
        </div>
    );
}

export default SudokuGrid;
