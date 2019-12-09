
class Cell {
    constructor (index, digit) {
        this.digit = digit || '0';
        if (!this.digit.match(/^[0-9]$/)) {
            throw new RangeError(
                `Invalid Cell() value '${this.digit}', expected '0'..'9'`
            );
        }
        this.row = Math.floor(index / 9) + 1;
        this.column = (index % 9) + 1;
        this.box = Math.floor((this.row - 1) / 3) * 3 + Math.floor((this.column - 1) / 3) + 1;
        this.location = `R${this.row}C${this.column}`;
        this.hasDigit = this.digit !== '0';
    }

    static newFromString81 (str) {
        return [...Array(81).keys()].map(i => new Cell(i, str[i]));
    }
}

export default Cell;
