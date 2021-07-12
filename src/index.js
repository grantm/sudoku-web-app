import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/app/app';
import * as serviceWorker from './serviceWorker';

document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "hidden") {
        const {grid} = JSON.parse(document.body.dataset.gameState || '{}');
        if (grid && grid.currentSnapshot && !grid.solved) {
            localStorage.setItem("gamestate", document.body.dataset.gameState);
        }
    }
});

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
