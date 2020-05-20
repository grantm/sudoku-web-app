import React from 'react';

import {version} from '../../../package.json';

export default function ModalAbout({modalHandler}) {
    const closeHandler = () => modalHandler('cancel');
    return (
        <div className="modal about">
            <h1>About this app</h1>
            <p>Application version: {version}</p>
            <p>This Sudoku web application was created for <a href="https://sudokuexchange.com/"
            >SodokuExchange.com</a> by <a href="https://grantm.github.io/">Grant McLean</a>.</p>
            <p>It is <a href="https://www.fsf.org/about/what-is-free-software">free software</a>{' '}
            which you can use, copy, modify and share under the terms of the
            GNU Affero General Public License version 3 (<a href="https://opensource.org/licenses/AGPL-3.0"
            >AGPLV3</a>). The source code is available at:<br />
            <a href="https://github.com/grantm/sudoku-web-app">https://github.com/grantm/sudoku-web-app</a>.</p>
            <p>Copyright © 2020 Grant McLean</p>
            <div className="buttons">
                <button className="primary" onClick={closeHandler}>OK</button>
            </div>
        </div>
    )
}
