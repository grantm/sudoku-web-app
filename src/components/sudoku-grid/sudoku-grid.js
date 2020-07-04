import React, { useState, useMemo } from 'react';

import './sudoku-grid.css';

import { SETTINGS } from '../../lib/sudoku-model.js';

import calculateGridDimensions from './grid-dimensions';
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

function useCellTouch (inputHandler) {
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
                inputHandler({type: 'cellTouched', cellIndex, value: cellIndex, source: 'touch'});
            }
            else if (eventType === 'touchmove') {
                inputHandler({type: 'cellSwipedTo', cellIndex, value: cellIndex, source: 'touch'});
            }
            setLastCellTouched(cellIndex);
            // console.log(`${eventType} event on cell #${cellIndex}`);
        }
    };
}


function SudokuGrid({grid, gridId, dimensions, isPaused, mouseDownHandler, mouseOverHandler, inputHandler}) {
    const cellSize = 100;
    const marginSize = 50;
    const dim = useMemo(() => calculateGridDimensions(cellSize, marginSize), [cellSize, marginSize]);
    const settings = grid.get('settings');
    const highlightMatches = settings[SETTINGS.highlightMatches];
    const showPencilmarks = grid.get('showPencilmarks');
    const matchDigit = highlightMatches ? grid.get('matchDigit') : undefined;
    const rawTouchHandler = useCellTouch(inputHandler);
    const cellContents = grid.get('cells').toArray().map((c, i) => {
        const cellDim = dim.cell[i];
        return (
            <SudokuCell
                key={cellDim.location}
                cell={c}
                dim={cellDim}
                cellSize={dim.cellSize}
                outerPencilOffsets={dim.outerPencilOffsets}
                showPencilmarks={showPencilmarks}
                matchDigit={matchDigit}
                isPaused={isPaused}
                mouseDownHandler={mouseDownHandler}
                mouseOverHandler={mouseOverHandler}
            />
        )
    });
    return (
        <div className="sudoku-grid"
            id={gridId || null}
            onTouchStart={rawTouchHandler}
            onTouchEnd={rawTouchHandler}
            onTouchMove={rawTouchHandler}
        >
            <svg version="1.1"
                style={{width: dimensions.gridLength}}
                viewBox={`0 0 ${dim.width} ${dim.height}`}
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect className="grid-bg" width="100%" height="100%" />
                {cellContents}
                <GridLines cellSize={dim.cellSize} marginSize={dim.marginSize} />
            </svg>
        </div>
    );
}

export default SudokuGrid;
