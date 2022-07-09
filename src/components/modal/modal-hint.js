import { useState } from 'react';

import Spinner from '../spinner/spinner';
import SudokuHintGrid from '../sudoku-grid/sudoku-hint-grid.js';

import { classList } from '../../lib/string-utils';

const solverURL = "https://github.com/SudokuMonster/SukakuExplainer/";


function DifficultyIndicator({hint}) {
    if (!hint.stepRating) {
        return null;
    }
    return (
        <div className="difficulty-indicator">
            <div className="title">Difficulty</div>
            <div className="rating-value for-step">{hint.stepRating}</div>
            <div className="rating-value for-puzzle">{hint.puzzleRating}</div>
            <div className="rating-label for-step">Step</div>
            <div className="rating-label for-puzzle">Puzzle</div>
        </div>
    );
}

function textWithRCHotSpots(text, hotSpotHandler) {
    return text.match(/(\b[rR][1-9][cC][1-9]\b|.+?(?=$|\b[rR][1-9][cC][1-9]\b))/g).map((s, i) => {
        const m = s.match(/^[rR]([1-9])[cC]([1-9])$/);
        if (m) {
            const index = (parseInt(m[1], 10) - 1) * 9 + parseInt(m[2], 10) - 1;
            return (
                <span
                    key={i}
                    className="rc-hot-spot"
                    data-cell-index={index}
                    onMouseEnter={hotSpotHandler}
                    onMouseLeave={hotSpotHandler}
                    onClick={hotSpotHandler}
                    onTouchStart={hotSpotHandler}
                >{s.toUpperCase()}</span>
            );
        }
        else {
            return s;
        }
    })
}

function HintBody({hint, hotSpotHandler, hotSpotIndex}) {
    const digits = hint.digits;
    const candidates = hint.candidates;

    const hintParas = hint.html.split(/<\/?p>/).filter(s => s && s.length > 0).map((s, i) => {
        return <p key={i}>{textWithRCHotSpots(s, hotSpotHandler)}</p>;
    })

    return (
        <div className="hint-body-layout">
            <SudokuHintGrid
                digits={digits}
                candidates={candidates}
                digitIndex={hint.digitIndex}
                digitValue={hint.digitValue}
                highlightCell={hint.highlightCell || {}}
                eliminationsByCell={hint.eliminationsByCell || {}}
                hotSpotIndex={hotSpotIndex}
            />
            <div className="hint-text-wrapper">
                <DifficultyIndicator hint={hint} />
                <div className="hint-text">
                    {hintParas}
                </div>
            </div>
        </div>
    );
}

function modalHintContent ({loading, loadingFailed, errorMessage, hint, hotSpotHandler, hotSpotIndex}) {
    if (loading) {
        return {
            title: "Loading hints",
            modalContent: <Spinner />,
            primaryButtonText: "Cancel",
        }
    }
    else if (loadingFailed) {
        console.log("Failed to load hint: ", errorMessage);
        const description = errorMessage === "Error: 400 Bad Request"
            ? (
                <p>The server was unable to provide hints for this puzzle.</p>
            )
            : <>
                <p>An error occurred while requesting hints from the server.</p>
                <p>You may wish to try again later.</p>
            </>;
        return {
            title: "Failed to load hints",
            modalContent: description,
            primaryButtonText: "Cancel",
        }
    }
    else if (hint) {
        return {
            title: textWithRCHotSpots(hint.title.replace(/,/g, ',\u200B'), hotSpotHandler),
            modalContent: <HintBody hint={hint} hotSpotHandler={hotSpotHandler} hotSpotIndex={hotSpotIndex}/>,
            primaryButtonText: "OK",
        }
    }
}

function HintButtons({loading, hint, modalHandler, menuHandler, children}) {
    const closeHandler = () => modalHandler('cancel');

    const candidatesHandler = () => {
        menuHandler("calculate-candidates");
        modalHandler('cancel');
    };
    const candidatesButton = (hint && hint.needCandidates)
        ? <button onClick={candidatesHandler}>Auto Fill Candidates</button>
        : null;

    const applyHintHandler = () => {
        modalHandler({action: 'apply-hint', hint});
    }
    const applyHintButton = (!loading && hint && !candidatesButton)
        ? <button onClick={applyHintHandler}>Apply Hint</button>
        : null;

    return (
        <div className="buttons">
            {candidatesButton}
            {applyHintButton}
            <button className="primary" onClick={closeHandler}>{children}</button>
        </div>
    );
}

export default function ModalHint({modalState, modalHandler, menuHandler}) {
    const [hotSpot, setHotSpot] = useState(null);
    const hotSpotHandler = (e) => {
        e.stopPropagation();
        const eventType = e.type;
        const index = parseInt(e.target.dataset.cellIndex, 10);
        if (index === undefined) {
            return setHotSpot(null);
        }
        if (eventType === 'mouseleave') {
            if (hotSpot && hotSpot.type === 'mouseenter') {
                return setHotSpot(null);
            }
        }
        else if (eventType === 'touchStart' && hotSpot && hotSpot.type === 'touchstart') {
            return setHotSpot(null);
        }
        else {
            return setHotSpot({
                type: eventType,
                index: index,
            })
        }
    }
    const modalClasses = classList(
        "modal hint",
        modalState.loading && "loading",
        modalState.loadingFailed && "loading-failed",
    );

    const hotSpotIndex = hotSpot && hotSpot.index;
    const {title, modalContent, primaryButtonText} = modalHintContent({...modalState, hotSpotHandler, hotSpotIndex});

    return (
        <div className={modalClasses}>
            <div className="hint-layout">
                <div className="hint-body">
                    <h1>{title}</h1>
                    {modalContent}
                    <HintButtons
                        loading={modalState.loading}
                        hint={modalState.hint}
                        modalHandler={modalHandler}
                        menuHandler={menuHandler}
                    >{primaryButtonText}</HintButtons>
                </div>
                <div className="hint-footer">
                    <span>Hints by: <a target="_blank" rel="noopener noreferrer" href={solverURL}>Sukaku Explainer</a></span>
                </div>
            </div>
        </div>
    );
}
