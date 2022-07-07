import React from 'react';
import { createRoot } from 'react-dom/client';
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

const root = createRoot(document.getElementById('root'));
root.render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
