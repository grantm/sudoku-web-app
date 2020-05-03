import React from 'react';

import { secondsAsHMS } from '../../lib/format-utils';


function siteURL () {
    return window.location.toString().replace(/\?.*$/, '');
}


function formattedTimeToBeat(startTime, endTime) {
    if (!endTime) {
        return null;
    }
    const seconds = Math.floor((endTime - startTime) / 1000);
    return secondsAsHMS(seconds);
}


function facebookShareURL (initialDigits) {
    const params = new URLSearchParams();
    params.set('u', `${siteURL()}?s=${initialDigits}`);
    return `https://facebook.com/sharer/sharer.php?${params.toString()}`.replace(/[+]/g, '%20');
}


function twitterShareURL (initialDigits, startTime, endTime) {
    const timeToBeat = endTime
        ? `\nTime to beat: ${formattedTimeToBeat(startTime, endTime)}\n`
        : '';
    const params = new URLSearchParams();
    params.set('text', `Here's a link to a puzzle on the Sudoku Exchange:${timeToBeat}`);
    params.set('url', `${siteURL()}?s=${initialDigits}`);
    return `https://twitter.com/intent/tweet/?${params.toString()}`.replace(/[+]/g, '%20');
}


function emailShareURL (initialDigits, startTime, endTime) {
    const timeToBeat = endTime
        ? `\nTime to beat: ${formattedTimeToBeat(startTime, endTime)}\n\n`
        : '';
    const body =
        `Here's a link to a Sudoku puzzle:\n\n` +
        `${siteURL()}?s=${initialDigits}\n\n${timeToBeat}\n\n`;
    const params = new URLSearchParams();
    params.set('subject', 'A Sudoku puzzle for you');
    params.set('body', body);
    return `mailto:?${params.toString()}`.replace(/[+]/g, '%20');
}


export default function ModalShare({modalState, modalHandler}) {
    const {initialDigits, startTime, endTime} = modalState;
    const closeHandler = () => modalHandler('cancel');
    return (
        <div className="modal share">
            <h1>Share this puzzle</h1>
            <div className="share-buttons">
                <ul>
                    <li>
                        <a className="btn-facebook" target="_blank" rel="noopener noreferrer"
                            href={facebookShareURL(initialDigits, startTime, endTime)}
                        >Share on Facebook</a>
                    </li>
                    <li>
                        <a className="btn-twitter" target="_blank" rel="noopener noreferrer"
                            href={twitterShareURL(initialDigits, startTime, endTime)}
                        >Share on Twitter</a>
                    </li>
                    <li>
                        <a className="btn-email"
                            href={emailShareURL(initialDigits, startTime, endTime)}
                        >Share by Email</a>
                    </li>
                </ul>
            </div>
            <p>You can also use your web browser’s tools to share the page you’re
            viewing right now.</p>
            <div className="buttons">
                <button onClick={closeHandler}>Close</button>
            </div>
        </div>
    )
}
