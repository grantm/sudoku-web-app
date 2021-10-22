import React from 'react';

import { secondsAsHMS } from '../../lib/string-utils';


const difficultyLevelName = {
    "1": "Easy",
    "2": "Medium",
    "3": "Hard",
    "4": "Diabolical",
};

function formatDifficulty(difficulty) {
    return difficultyLevelName[difficulty] || <i>Unknown</i>;
}


function formatDate(timestamp) {
    const dt = new Date(timestamp);
    try {
        return new Intl.DateTimeFormat([], {dateStyle: 'medium', timeStyle: 'short'}).format(dt);
    } catch (e) {
        return dt.toLocaleString({month: 'short'});
    }
}


function SavedPuzzleMetadata({difficultyLevel, startTime, lastUpdatedTime, elapsedTime}) {
    return (
        <table className="puzzle-metadata">
            <tbody>
                <tr>
                    <th>Difficulty:</th>
                    <td>{formatDifficulty(difficultyLevel)}</td>
                </tr>
                <tr>
                    <th>Started:</th>
                    <td>{formatDate(startTime)}</td>
                </tr>
                <tr>
                    <th>Last update:</th>
                    <td>{formatDate(lastUpdatedTime)}</td>
                </tr>
                <tr>
                    <th>Timer:</th>
                    <td>{secondsAsHMS(Math.floor(elapsedTime/1000))}</td>
                </tr>
            </tbody>
        </table>
    );
}


export default SavedPuzzleMetadata;
