function stopPropagation (e) {
    e.stopPropagation();
}

function GridLines({cellSize, marginSize}) {
    const gridLength = 9 * cellSize;

    const fineLines =
        [1, 2, 4, 5, 7, 8].map(i => {
            const offSet = marginSize + i * cellSize;
            return `M ${marginSize} ${offSet} h ${gridLength} M ${offSet} ${marginSize} v ${gridLength}`
        }).join(' ');
    const boldLines =
        [3, 6].map(i => {
            const offSet = marginSize + i * cellSize;
            return `M ${marginSize} ${offSet} h ${gridLength} M ${offSet} ${marginSize} v ${gridLength}`
        }).join(' ');
    return (
        <g>
            <path className="line" d={fineLines} onMouseDown={stopPropagation} />
            <path className="line-bold" d={boldLines} onMouseDown={stopPropagation} />
            <rect className="line-bold"
                x={marginSize}
                y={marginSize}
                width={gridLength}
                height={gridLength}
                fill="transparent"
                onMouseDown={stopPropagation}
            />
        </g>
    );
}

export default GridLines;
