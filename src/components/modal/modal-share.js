import React, { useState, useCallback } from 'react';

import { modelHelpers } from '../../lib/sudoku-model.js';
import { secondsAsHMS } from '../../lib/format-utils';


function puzzleURL(initialDigits, difficulty, vector) {
    const baseURL = window.location.toString().replace(/\?.*$/, '');
    const params = new URLSearchParams();
    params.set('s', initialDigits);
    if (difficulty) {
        params.set('d', difficulty);
    }
    if (vector) {
        params.set('v', vector);
    }
    return baseURL + '?' + params.toString();
}

function difficultyLevelName(value) {
    if (value) {
        return modelHelpers.difficultyLevelName(value) || '';
    }
    return '';
}


function formattedTimeToBeat(startTime, endTime) {
    if (!endTime) {
        return null;
    }
    const seconds = Math.floor((endTime - startTime) / 1000);
    return secondsAsHMS(seconds);
}


function facebookShareURL (initialDigits, difficultyLevel) {
    const params = new URLSearchParams();
    params.set('u', puzzleURL(initialDigits, difficultyLevel, 'sbf'));
    return `https://facebook.com/sharer/sharer.php?${params.toString()}`.replace(/[+]/g, '%20');
}


function twitterShareURL (initialDigits, difficulty, solveTime) {
    const levelName = difficultyLevelName(difficulty);
    const difficultyLevel = levelName ? `Difficulty level: ${levelName}\n` : '';
    const timeToBeat = solveTime ? `Time to beat: ${solveTime}\n` : '';
    const params = new URLSearchParams();
    params.set('text', `Here's a link to a puzzle on #SudokuExchange:\n${difficultyLevel}${timeToBeat}`);
    params.set('url', puzzleURL(initialDigits, difficulty, 'sbt'));
    return `https://twitter.com/intent/tweet/?${params.toString()}`.replace(/[+]/g, '%20');
}


function emailShareURL (initialDigits, difficulty, solveTime) {
    const pURL = puzzleURL(initialDigits, difficulty, 'sbe');
    const levelName = difficultyLevelName(difficulty);
    const difficultyLevel = levelName ? `Difficulty level: ${levelName}\n` : '';
    const timeToBeat = solveTime ? `Time to beat: ${solveTime}\n` : '';
    const body =
        `Here's a link to a Sudoku puzzle on SudokuExchange.com:\n\n` +
        `${pURL}\n\n${difficultyLevel}${timeToBeat}\n`;
    const params = new URLSearchParams();
    params.set('subject', 'A Sudoku puzzle for you');
    params.set('body', body);
    return `mailto:?${params.toString()}`.replace(/[+]/g, '%20');
}


function DifficultyOption({value, name, selectedValue, changeHandler}) {
    const isChecked = value === selectedValue;
    return (
        <label>
            <input type="radio" value={value} checked={isChecked} onChange={changeHandler} />
            <span>{name}</span>
        </label>
    );
}


function DifficultySelector({difficulty, changeHandler}) {
    const options = modelHelpers.allDifficultyLevels().map(lvl => {
        return (
            <DifficultyOption
                key={lvl.value}
                selectedValue={difficulty}
                value={lvl.value}
                name={lvl.name}
                changeHandler={changeHandler}
            />
        );
    })
    return (
        <div className="difficulty-selector">
            <p>Difficulty level:</p>
            <div className="difficulty-options">
                {options}
            </div>
        </div>
    );
}


export default function ModalShare({modalState, modalHandler, menuHandler}) {
    const {initialDigits, difficultyLevel, startTime, endTime} = modalState;
    const solveTime = endTime ? formattedTimeToBeat(startTime, endTime) : null;

    const [difficulty, setDifficulty] = useState(difficultyLevel);
    const [shareTime, setShareTime] = useState(!!endTime);

    const thisURL = puzzleURL(initialDigits, difficulty);
    const saveScreenshotHandler = (e) => {
        e.preventDefault();
        menuHandler("save-screenshot");
    }

    const closeHandler = () => modalHandler('cancel');

    const qrHandler = () => modalHandler({
        action: 'show-qr-modal',
        puzzleURL: thisURL,
    });

    const changeDifficulty = useCallback(
        (e) => { setDifficulty(e.target.value); },
        [setDifficulty]
    );

    const toggleShareTime = useCallback(
        (e) => { setShareTime(!shareTime); },
        [shareTime, setShareTime]
    );

    const shareClasses = "share-time" + (shareTime ? '' : ' no-share');
    const shareTimeQuestion = endTime
        ? (
            <p className={shareClasses}>
                <label>
                    <input type="checkbox" value={shareTime} onChange={toggleShareTime} checked={shareTime}/>
                    <span className="indicator" />
                    Share your time: {solveTime}
                </label>
            </p>
        )
        : null;

    const shareSolveTime = shareTime ? solveTime : null;

    return (
        <div className="modal share">
            <h1>Share this puzzle</h1>
            <DifficultySelector difficulty={difficulty} changeHandler={changeDifficulty} />
            {shareTimeQuestion}
            <div className="share-buttons">
                <ul>
                    <li>
                        <a className="btn-facebook" target="_blank" rel="noopener noreferrer"
                            href={facebookShareURL(initialDigits, difficulty)}
                        >Share on Facebook</a>
                    </li>
                    <li>
                        <a className="btn-twitter" target="_blank" rel="noopener noreferrer"
                            href={twitterShareURL(initialDigits, difficulty, shareSolveTime)}
                        >Share on Twitter</a>
                    </li>
                    <li>
                        <a className="btn-email"
                            href={emailShareURL(initialDigits, difficulty, shareSolveTime)}
                        >Share by Email</a>
                    </li>
                    <li>
                        <button className="btn-qr" onClick={qrHandler}
                        >Share by QR Code</button>
                    </li>
                </ul>
            </div>
            <p>Or, just share the <a href={thisURL}>URL of this page</a>.</p>
            <p>Alternatively, you can download the puzzle as{' '}
                <a
                    href="./"
                    onClick={saveScreenshotHandler}
                >an image</a>.
            </p>
            <div className="buttons">
                <button onClick={closeHandler}>Close</button>
            </div>
        </div>
    )
}
