import React from 'react';

import './help.css';

export default function HelpPage({modalHandler}) {
    const closeHandler = () => modalHandler('cancel');
    const difficultyRatingsURL = "https://github.com/SudokuMonster/SukakuExplainer/wiki/Difficulty-Ratings-in-Sukaku-Explainer-v1.17.8";
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
            click ‘Start’ to begin solving.</p>

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
            <p>Don’t worry if your selection includes cells which already contain completed
            digits - these cells will not be affected by entering pencil marks.</p>
            <p>Two different types of pencil marks can be added:</p>
            <ul>
                <li>outer pencil marks are intended for so-called “Snyder notation” and are
                entered using Shift+Digit</li>
                <li>inner pencil marks are intended for pairs/triples/candidates and are entered
                using Ctrl+Digit</li>
            </ul>
            <p>Alternatively, the on-screen keyboard includes mode buttons for the different
            types of pencil marks.  Simply select a mode then use the digit buttons to toggle
            the pencil marks on and off.</p>
            <p>In addition to the pencil marks you can apply one a colour highlight to the
            selected cells. If you have coloured a number of cells and wish to return them
            to an uncoloured state, you can double-click the colour mode button.</p>
            <p>You can also switch modes from your keyboard with the following hot keys:</p>
            <ul>
                <li><b>Z</b> - Normal digits</li>
                <li><b>X</b> - Outer pencil marks</li>
                <li><b>C</b> - Inner pencil marks</li>
                <li><b>V</b> - Cell colours</li>
            </ul>
            <p>If you have switched to a pencil marking mode (inner or outer), you can still
            enter a digit by double-tapping/clicking that digit on the on-screen keyboard.
            The double-click action overrides the current mode and does a normal digit entry,
            but afterwards you remain in the original pencil marking mode.</p>
            <p>Sometimes you might enter some ‘outer’ pencil marks and then realise that the
            selected cells form a pair or a triple.  If you want to switch all the pencil marks
            in the selected cells to ‘inner’ pencil marks, use the ‘.’ (dot or period) key or
            double-tap/click the inner pencil marks mode button.</p>
            <p>If you only wish to use one type of pencil mark instead of the separate ‘inner’
            and ‘outer’ pencil marks, you can select the <b>“Simple” pencil making mode</b>
            using the “Settings” menu option.</p>
            <p>There are also two pencil-mark-related menu options:</p>
            <ul>
                <li><b>Hide/Show Pencilmarks</b> — can be used to temporarily hide pencil
                marks and cell colouring to reduce on-screen clutter (hot key: <b>P</b>).</li>
                <li><b>Clear all pencil marks</b> — will permanently discard all pencil
                marks and cell colouring you have added to the grid.</li>
            </ul>

            <h2>Alternate cursor movement keys</h2>

            <p>In addition to the arrow keys, the 'WASD' keys may be used as follows:</p>

            <ul>
                <li><b>W</b> - Up</li>
                <li><b>A</b> - Left</li>
                <li><b>S</b> - Down</li>
                <li><b>D</b> - Right</li>
            </ul>

            <p>These keys can be combined with Ctrl or Shift to extend the selection,
            however be warned that Ctrl-W is commonly used as a hot key to close the current
            browser tab and that function cannot be intercepted on all browsers.</p>

            <h1>Undo / redo</h1>
            <p>If you make a mistake, you can undo one or more steps using Ctrl-Z, or ‘[’,
            or the undo button on the on-screen keypad.</p>
            <p>After using undo, you can use Ctrl-Y or, or ‘]’, or the on-screen redo button
            to replay one or more actions.</p>
            <p>You can use Delete or Backspace to remove a digit or pencil marks from
            selected cells.</p>
            <p>The Esc key will cancel the current selection.</p>

            <h1>Settings</h1>
            <p>The “Settings” menu option allows you to turn on the features you find helpful
            and turn off the features you find annoying.  The settings should be ‘sticky’
            across multiple visits to the site.</p>
            <dl>
                <dt>Dark mode</dt>
                <dd>Change the application theme colours to use a darker background
                and lighter colours for interactive elements.  Some people will
                find this results in less eye strain.</dd>
                <dt>Show Timer</dt>
                <dd>If you don’t need the added pressure of a clock ticking while you’re
                trying to think, turn this option off.</dd>
                <dt>“Simple” pencil marking mode</dt>
                <dd>If you don’t wish to use two different types of pencil marks, turn this
                option on. This will cause the pencil-marked digits to be arranged in a 3x3
                grid within each cell.</dd>
                <dt>Highlight matching digits</dt>
                <dd>When you select a cell containing a digit, the app will highlight all
                other cells that contain the same digit (either full digit or pencil mark).
                Some people find this helpful others may find it distracting or even consider
                it cheating.</dd>
                <dt>Highlight conflicting digits</dt>
                <dd>When you enter a digit and that digit is already present in the same
                row, column or 3x3 box, the app can highlight the digit to alert you to the
                mistake. Some people consider this cheating.  Note, just because a digit you
                entered is not highlighted as ‘conflicting’ doesn’t mean it’s correct.</dd>
                <dt>Auto-clean pencil marks</dt>
                <dd>When you enter a digit, the app will remove that digit from any pencil
                marks in the same row, column or 3x3 box.  If you don’t want your pencil
                marks to be cleaned up automatically, turn this option off.</dd>
                <dt>Show puzzle rating numbers</dt>
                <dd>The “recently shared puzzle” section, includes a yellow bar under each
                puzzle to give you an idea of its difficulty.  The longer the bar, the more
                difficult the puzzle.  With this option turned on, the bar will also show
                the <a href={difficultyRatingsURL} target="_blank" rel="noreferrer">difficulty
                rating number</a> - which might be useful if you're looking for a puzzle to
                practice a specific technique. Some people might consider showing the precise
                rating number to be a “spoiler”, so this option is off by default.</dd>
                <dt>Flip on-screen keyboard digits</dt>
                <dd>The default layout for the on-screen keyboard is like a phone dialler
                with 1-2-3 across the top. This option allows you to flip the rows so that
                1-2-3 is across the bottom to match the numeric keypad on a desktop computer.</dd>
                <dt>Play animation when puzzle solved</dt>
                <dd>When you have successfully solved a puzzle, the app will play a brief,
                but some would say “satisfying”, animated colour sequence.  If you are
                sensitive to flashing lights you should turn this off.</dd>
            </dl>

            <h1>Other operations</h1>
            <p>To switch the app into full-screen mode use the button on the status bar or
            the ‘F’ key on the keyboard.</p>
            <p>A number of other options are available via the menu button (&#9776;) in the
            top right corner:</p>
            <dl>
                <dt>Sharing a Puzzle</dt>
                <dd>You can share any puzzle by simply copying the link from your browser URL bar.
                To make this a little easier, this menu option has buttons to share the puzzle
                using Twitter, Facebook or email.</dd>
                <dt>Show/Hide pencil marks</dt>
                <dd>Temporarily hide pencil marks and cell colouring.</dd>
                <dt>Clear all pencil marks</dt>
                <dd>If things are getting too messy, use this option to discard all your pencil
                marks and cell colouring, leaving the original starting digits and any digits
                you have entered.</dd>
                <dt>Save a screenshot</dt>
                <dd>Take a snapshot of just the Sudoku grid part of the screen, including pencil
                marks, colouring and cell highlighting, and save it as a PNG download.</dd>
                <dt>SudokuWiki.org solver</dt>
                <dd>If you get stuck, there’s a menu option to open the puzzle in the sudoku solver
                on <a href="https://www.sudokuwiki.org/sudoku.htm">sudokuwiki.org</a>.  This option
                automates opening the solver page and pasting in the starting digits of the puzzle.
                Note, none of the digits you have entered so far are copied across.</dd>
                <dt>Enter a new puzzle</dt>
                <dd>Allows you to take a puzzle from somewhere else (e.g.: a newspaper or magazine)
                and type the starting digits directly into the grid.  Move between cells using the
                arrows keys or the mouse (or touchscreen).</dd>
                <dt>Paste a new puzzle</dt>
                <dd>This option is useful if you have a puzzle in the form of a string of 81 digits
                (‘0’ for empty cells).  You could enter that string directly in the URL, but the
                URL bar is not always available on mobile devices when you’ve saved this site to
                your home screen.</dd>
                <dt>Browse “recently shared”</dt>
                <dd>This option allows you to select puzzles that other users have shared recently
                on the SudokuExchange web site.  This list of puzzles is gather from the web
                server logs (through a process that should be a lot more automated than it
                currently is).</dd>
                <dt>About this app</dt>
                <dd>Find information about the application version number, who wrote it and where
                you can get access to the source code.</dd>
            </dl>

        </div>
    </div>;
}
