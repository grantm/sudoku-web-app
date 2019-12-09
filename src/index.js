import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/app/app';
import * as serviceWorker from './serviceWorker';

import Cell from './lib/cell.js';

const cells = Cell.newFromString81(
    '000001230123008040804007650765000000000000000000000123012300804080400765076500000'
);
ReactDOM.render(<App cells={cells} />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
