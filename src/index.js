import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/app/app';
import * as serviceWorker from './serviceWorker';

window.addEventListener('beforeunload', function (e) { // consider changing this logic as beforeunload not recommended, and add logic to save the current snapshot to local storage
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
    if (document.visibilityState === "hidden") {
        const gameState = document.body.dataset;
        const solved = document.querySelector('.sudoku-app.solved');
        if (solved) {
            localStorage.removeItem("gamestate");
        }
        else if (gameState) {
            const toSave = {
                snapshot: gameState.currentSnapshot || '',
                initialDigits: gameState.initialDigits,
                lastPlayedTime: new Date()
            };
    
            localStorage.setItem("gamestate", JSON.stringify(toSave));
        }
    }

});

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
