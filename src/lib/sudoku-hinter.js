const allDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

export class SudokuHinter {
    constructor(cells) {
        this.row = [];
        this.col = [];
        this.box = [];
        this.boxRestrictions = [];
        this.cells = cells;
        cells.forEach(c => {
            const i = c.get('index');
            const d = c.get('digit');
            ['row', 'col', 'box'].forEach(regionType => {
                const regionNum = c.get(regionType);
                this[regionType][regionNum] = this[regionType][regionNum] || {};
                if (d !== '0') {
                    this[regionType][regionNum][d] = true;
                }
            });
            if(d === '0') {
                const box = c.get('box');
                const br = this.boxRestrictions[box] = this.boxRestrictions[box] || {};
                c.get('outerPencils').toArray().forEach(pd => {
                    br[pd] = br[pd] || {};
                    br[pd][i] = true;
                });
            }
        });
    }

    calculateCellCandidates() {
        return this.cells.map((c, index) => {
            const d = c.get('digit');
            if (d !== '0') {
                return null;
            }
            else {
                const row = this.row[c.get('row')];
                const col = this.col[c.get('col')];
                const boxNum = c.get('box');
                const box = this.box[boxNum];
                return allDigits.filter(d => {
                    return !(row[d] || col[d] || box[d]) &&
                        !this.digitIsRestrictedElsewhereInBox(boxNum, d, index);
                });
            }
        });
    }

    hasDigitInRegion(digit, regionType, regionNum) {
        const digitSet = (this[regionType] || [])[regionNum] || {}
        return digitSet[digit] || false;
    }

    digitIsRestrictedElsewhereInBox(box, digit, index) {
        const digitRestrictions = this.boxRestrictions[box][digit];
        if (!digitRestrictions) {
            return false
        }
        if (digitRestrictions[index]) {
            return false;
        }
        return true;
    }
}
