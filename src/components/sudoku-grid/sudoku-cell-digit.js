export default function SudokuCellDigit({cell, dim, fontSize}) {
    const digit = cell.get('digit');
    if (digit === '0') {
        return null;
    }
    const classes = [ 'digit' ];
    if (cell.get('isGiven')) {
         classes.push('given');
    }
    if (cell.get('errorMessage') !== undefined) {
        classes.push('error');
    }
    return (
        <text
            className={classes.join(' ')}
            x={dim.textX}
            y={dim.textY}
            fontSize={fontSize}
            textAnchor="middle"
        >
            {digit}
        </text>
    );
}
