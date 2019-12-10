
class Cell {
    constructor (index, digit) {
        this.index = index;
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
        this.x = 50 + (this.column - 1) * 100;
        this.y = 50 + (this.row - 1) * 100;
        this.selected = false;
    }

    mutate (changes) {
        const newCell = new Cell(this.index, this.digit);
        return Object.assign(newCell, this, changes);
    }
}

class SudokuModel {
    constructor (cells) {
        this.cells = cells;
    }

    mapCells (handler) {
        return this.cells.map(handler);
    }

    mutateCells (mapFunc) {
        const newCells = this.mapCells(mapFunc);
        return new SudokuModel(newCells);
    }

    static newFromString81 (str) {
        const cells = [...Array(81).keys()].map(i => new Cell(i, str[i]));
        return new SudokuModel(cells);
    }

}

export default SudokuModel;
