import React from 'react';

function GridLines() {
    const fineLines =
        [150, 250, 450, 550, 750, 850].map(i => {
            return `M 50 ${i} h 900 M ${i} 50 v 900`
        }).join(' ');
    const boldLines =
        [350, 650].map(i => {
            return `M 50 ${i} h 900 M ${i} 50 v 900`
        }).join(' ');
    return (
        <g>
            <path className="line" d={fineLines} pointerEvents="none" />
            <path className="line-bold" d={boldLines} pointerEvents="none" />
            <rect className="line-bold" x="50" y="50" width="900" height="900" fill="transparent" pointerEvents="none" />
        </g>
    );
}

export default GridLines;
