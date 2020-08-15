import React, { useState } from "react";

import "./sudoku-grid.css";

import { SETTINGS } from "../../lib/sudoku-model.js";

import SudokuCell from "./sudoku-cell";
import GridLines from "./grid-lines.js";

function indexFromTouchEvent(e) {
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

function useCellTouch(inputHandler) {
  const [lastCellTouched, setLastCellTouched] = useState(false);
  return (e) => {
    e.preventDefault();
    e.stopPropagation();
    const eventType = e.type;
    if (eventType === "touchend") {
      setLastCellTouched(undefined);
      return;
    }
    const cellIndex = indexFromTouchEvent(e);
    if (cellIndex !== undefined && cellIndex !== lastCellTouched) {
      if (eventType === "touchstart") {
        inputHandler({
          type: "cellTouched",
          cellIndex,
          value: cellIndex,
          source: "touch",
        });
      } else if (eventType === "touchmove") {
        inputHandler({
          type: "cellSwipedTo",
          cellIndex,
          value: cellIndex,
          source: "touch",
        });
      }
      setLastCellTouched(cellIndex);
      // console.log(`${eventType} event on cell #${cellIndex}`);
    }
  };
}

function SudokuGrid({
  grid,
  gridId,
  dimensions,
  isPaused,
  mouseDownHandler,
  mouseOverHandler,
  inputHandler,
}) {
  const settings = grid.get("settings");
  const highlightMatches = settings[SETTINGS.highlightMatches];
  const showPencilmarks = grid.get("showPencilmarks");
  const matchDigit = highlightMatches ? grid.get("matchDigit") : undefined;
  const rawTouchHandler = useCellTouch(inputHandler);
  const focusedCell = grid
    .get("cells")
    .filter((c) => c.get("index") === grid.get("focusIndex"))
    .get(0);

  const cellContents = grid
    .get("cells")
    .toArray()
    .map((c) => {
      return (
        <SudokuCell
          key={c.get("location")}
          cell={c}
          showPencilmarks={showPencilmarks}
          matchDigit={matchDigit}
          isPaused={isPaused}
          mouseDownHandler={mouseDownHandler}
          mouseOverHandler={mouseOverHandler}
          selectedRow={focusedCell?.get("row")}
          selectedCol={focusedCell?.get("col")}
        />
      );
    });
  return (
    <div
      className="sudoku-grid"
      id={gridId || null}
      onTouchStart={rawTouchHandler}
      onTouchEnd={rawTouchHandler}
      onTouchMove={rawTouchHandler}
    >
      <svg
        version="1.1"
        style={{ width: dimensions.gridLength }}
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
