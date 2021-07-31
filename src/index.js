import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/app/app';
import * as serviceWorker from './serviceWorker';

window.addEventListener('beforeunload', function (e) {
    // If a puzzle is in progress, allow user to cancel page unload
    const currentSnapshot = document.body.dataset.currentSnapshot;
    const solved = document.querySelector('.sudoku-app.solved');
    if (currentSnapshot && !solved) {
        e.preventDefault();     // Sufficient for Firefox
        e.returnValue = '';     // Needed by Chrome
    }
    // otherwise leave page unload to proceed unhindered
});

document.addEventListener("visibilitychange", function() {
    // Ensure that we accurately keep track of how long the user has been working on the puzzle 
    // so we display time correctly if they resume.
    if (document.visibilityState === "hidden") {
        const params = new URLSearchParams(window.location.search);
        const gamestate = localStorage.getItem("gamestate");
        // Only bump the time if we were working on the puzzle - NOTE: This is a best-effort heuristic.
        if (params.has("s") && gamestate) {
            localStorage.setItem("gamestate", JSON.stringify({
                ...JSON.parse(gamestate),
                lastUpdatedTime: Date.now(),
            }));
        }
    }
});

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();