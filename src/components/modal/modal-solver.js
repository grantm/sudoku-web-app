import React, { useState } from 'react';


export default function ModalSolver({modalHandler, modalState}) {
    const [includeProgress, setIncludeProgress] = useState(false);

    const inputHandler = (e) => setIncludeProgress(e.target.checked);
    const cancelHandler = () => modalHandler('cancel');
    const {initialDigits, allDigits} = modalState;
    const linkDigits = includeProgress ? allDigits :initialDigits;
    return (
        <div className="modal solver">
            <h1>Open in SudokuWiki.org solver</h1>
            <p>
                <label className="checkbox-label">
                    <input type="checkbox" checked={includeProgress} onChange={inputHandler} />
                    <span>Include digits you have entered</span>
                </label>
            </p>
            <p>

            </p>
            <div className="buttons">
                <button className="cancel" onClick={cancelHandler}>Cancel</button>
                <a className="btn primary"
                    href={`https://www.sudokuwiki.org/sudoku.htm?bd=${linkDigits}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >Open in solver</a>
            </div>
        </div>
    );
}
