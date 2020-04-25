import React from 'react';

import './help.css';

export default function HelpPage({modalHandler}) {
    const closeHandler = () => modalHandler('cancel');
    return <div className="help-page">
        <div className="content">
            <button className="close-button" onClick={closeHandler}>×</button>
            <h1>Getting started</h1>
            <p>If you follow a link to a specific sudoku puzzle, the app will open
            in <strong>solve</strong> mode - allowing you to start solving the puzzle
            and entering the missing digits.</p>
            <p>Alternatively, you can start in <strong>enter</strong> mode with an
            empty grid - allowing you to enter the starting digits for a sudoku
            puzzle (perhaps by transcribing from a newspaper or magazine), then
            click 'Start' to begin solving.</p>

            <h1>Entering digits</h1>
            <p>To enter a digit, first select a cell in the grid by either:</p>
            <ul>
                <li>clicking with the mouse or tapping the cell on your mobile device screen</li>
                <li>using the arrow keys on your computer keyboard</li>
            </ul>
            <p>Then enter a digit by either:</p>
            <ul>
                <li>tapping/clicking the digit on the onscreen keyboard</li>
                <li>typing the digit on your computer keyboard</li>
            </ul>

            <h1>Entering “pencil marks”</h1>
            <p>Once again, the first step is to select one or more cells:</p>
            <ul>
                <li>click or tap and drag to select multiple cells</li>
                <li>use Shift-click or Ctrl-click to select additional cells</li>
                <li>use Shift or Ctrl with the arrow keys to extend the selection</li>
                <li>use Shift-space or Ctrl-space to select or unselect the current cell</li>
            </ul>
            <p>Don't worry if your selection includes cells which already contain completed
            digits - these cells will not be affected by entering pencil marks.</p>
            <p>Two different types of pencil marks can be added:</p>
            <ul>
                <li>outer pencil marks are intended for so-called “Snyder notation” and are
                entered using Shift+Digit</li>
                <li>inner pencil marks are intended for pairs/triples and are entered using
                Ctrl+Digit</li>
            </ul>
            <p>Alternatively, the on-screen keyboard includes mode buttons for the different
            types of pencil marks.  Simply select a mode then use the digit buttons to toggle
            the pencil marks on and off.</p>
            <p>In addition to the pencil marks you can apply one a colour highlight to the
            selected cells. If you have coloured a number of cells and wish to return them
            to an uncoloured state, you can double-click the colour mode button.</p>
            <p>You can also switch modes from your keyboard with the following hot keys:</p>
            <ul>
                <li>Z - Normal digits</li>
                <li>X - Outer pencil marks</li>
                <li>C - Inner pencil marks</li>
                <li>Z - Cell colours</li>
            </ul>
            <p>The app menu includes an option to clear all pencil marks in a single
            action.</p>

            <h1>Undo / redo</h1>
            <p>If you make a mistake, you can undo one or more steps using Ctrl-Z or the
            undo button on the on-screen keypad.</p>
            <p>After using undo, you can use Ctrl-Y or the on-screen redo button to replay
            one or more actions.</p>
            <p>You can use Delete or Backspace to remove a digit or pencil marks from
            selected cells.</p>
            <p>The Esc key will cancel the current selection.</p>

            <h1>Other operations</h1>
            <p>To switch the app into full-screen mode use the button on the status bar or
            the 'F' key on the keyboard.</p>
            <p>You can simply share the URL of the puzzle page.  To make this a little easier,
            there's a menu option to email a link to a friend.</p>
            <p>If you get stuck, there's a menu option to open the puzzle in the sudoku solver
            on <a href="https://www.sudokuwiki.org/sudoku.htm">sudokuwiki.org</a>.</p>
            <p>The menu also includes a Settings option to turn on some features that you
            might find helpful or to turn off features you find annoying.</p>

        </div>
    </div>;
}
