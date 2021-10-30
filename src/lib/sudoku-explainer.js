import { Range } from './not-mutable';
import { cellSet, cellProp } from './sudoku-cell-sets';

const allDigits = '123456789';

class SudokuExplainer {
    constructor(analysis) {
        this.finalDigits = analysis.fd.split('');
        this.rating = analysis.rt;

        let digits = analysis.id.split('');
        let candidates = Range(0, 81).toArray().map(() => allDigits);
        Range(0, 81).forEach((i) => {
            if (digits[i] !== '0') {
                [digits, candidates] = this.placeDigit(i, digits, candidates);
            }
        });
        this.initialDigits = digits;
        this.initialCandidates = candidates;
        this.steps = this.inflate(analysis.ss);
    }

    placeDigit(index, digits, candidates) {
        const d = digits[index] = this.finalDigits[index];
        // Eliminate candidates from affected cells
        const cp = cellProp[index];
        [
            cellSet.row[ cp.row ],
            cellSet.col[ cp.col ],
            cellSet.box[ cp.box ],
        ].flat().forEach((i) => {
            if (i === index) {
                candidates[i] = d;
            }
            else {
                candidates[i] = this.eliminateCandidate(d, candidates[i]);
            }
        });
        return [digits, candidates];
    }

    eliminateCandidate(d, cellCandidates) {
        return cellCandidates.replace(d, '');
    }

    inflate(sparseSteps) {
        let digits = this.initialDigits;
        let candidates = this.initialCandidates;
        const steps = sparseSteps.map((s) => {
            const step = {
                digits: digits,
                candidates: candidates,
                stepRating: s.rt,
                title: s.sd,
                html: s.ht,
            };
            digits = digits.slice(0);  // Take a copy
            candidates = candidates.slice(0);  // Take a copy
            if (s.hi !== undefined) {
                const highlightCell = step.highlightCell = {};
                s.hi.forEach(i => {
                    highlightCell[i] = true;
                });
            }
            if (s.di !== undefined) {
                step.digitIndex = s.di;
                step.digitValue = this.finalDigits[s.di];
                [digits, candidates] = this.placeDigit(s.di, digits, candidates);
            }
            else if (s.ec !== undefined) {
                const ec = s.ec;
                const bc = step.eliminationsByCell = {};
                Object.keys(ec).forEach(d => {
                    ec[d].forEach(i => {
                        bc[i] = bc[i] || {};
                        bc[i][d] = true;
                        candidates[i] = this.eliminateCandidate(d, candidates[i]);
                    });
                })
            }
            return step;
        });
        return steps;
    }

    findNextStep(currDigits, currCandidates) {
        for(let i = 0; i < this.steps.length; i++) {
            const s = this.steps[i];
            if (s.digitValue) {
                if (currDigits[s.digitIndex] === '0') {
                    const candidates = currCandidates.map((cc, i) => {
                        return (i === s.digitIndex && cc === "")
                            ? s.digitValue
                            : cc
                    })
                    return {
                        ...s,
                        digits: currDigits,
                        candidates: candidates,
                        puzzleRating: this.rating,
                        hintIndex: i,
                    };
                }
            }
            else {
                const checkResult = this.checkCandidatesForStep(s, currDigits, currCandidates);
                if (checkResult.candidatesStep) {
                    return checkResult.candidatesStep;
                }
                else if (checkResult.eliminationPending) {
                    return {
                        ...s,
                        digits: currDigits,
                        candidates: currCandidates,
                        puzzleRating: this.rating,
                        hintIndex: i,
                    };
                }
            }
        }
        throw new Error("Failed to find hint step");
    }

    checkCandidatesForStep(s, currDigits, currCandidates) {
        if (!s.eliminationsByCell) {
            throw new Error("No handler for hint step with no new digit and no eliminations");
        }
        const candidatesNeeded = {};
        let eliminationPending = false;
        if (s.highlightCell) {
            Object.keys(s.highlightCell).forEach(k => {
                const i = parseInt(k, 10);
                const cc = currCandidates[i];
                if (currDigits[i] === "0" && cc === "") {
                    candidatesNeeded[k] = true;
                }
            });
        }
        if (s.eliminationsByCell) {
            Object.keys(s.eliminationsByCell).forEach(k => {
                const i = parseInt(k, 10);
                const cc = currCandidates[i];
                if (currDigits[i] === "0") {
                    if (cc === "") {
                        candidatesNeeded[k] = true;
                    }
                    else  {
                        const cellEliminiations = s.eliminationsByCell[k];
                        Object.keys(cellEliminiations).forEach(d => {
                            if (cc.indexOf(d) > -1) {
                                eliminationPending = true;
                            }
                        });
                    }
                }
            });
        }
        if (Object.keys(candidatesNeeded).length > 0) {
            return {
                candidatesStep: {
                    needCandidates: true,
                    title: "Enter candidates",
                    html: "<p>Enter all possible candidates in the highlighted cells.</p>",
                    highlightCell: candidatesNeeded,
                    digits: currDigits,
                    candidates: currCandidates,
                }
            };
        }
        return {
            eliminationPending
        };
    }
}

export default SudokuExplainer;
