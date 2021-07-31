import SudokuExplainer from './sudoku-explainer';

const analysisPartial = {
    "fd" : "981745362732916548645832719174658923869321475523497186496183257358274691217569834",
    "id" : "900745360730006000645832719174658923069320070023007006496003007350070690207569034",
    "rt" : "3.2",
    "ss" : [
        {
            "di" : 58,
            "ht" : "<p> The cell r7c5 is the only possible position of the value 8 in the block. </p>",
            "rt" : "1.2",
            "sd" : "Hidden Single: r7c5: 8 in block"
        },
        {
            "di" : 61,
            "hi" : [16, 52],
            "ht" : "<p> The two cells r2c8 and r6c8 are the only possible positions of the two values 4 and 8 in the column. Because the number of possible cells matches the number of values, these two cells must contain these two values in any order. </p> <p> Other values can therefore not be in these cells. It follows that the cell r7c8 is the only remaining possible position of the value 5 in the column. </p>",
            "rt" : "2.0",
            "sd" : "Direct Hidden Pair: Cells r2c8,r6c8: 4,8 in column"
        },
        {
            "ec" : {
                "1" : [11],
            },
            "hi" : [12, 13],
            "ht" : "<p> All the potential positions of the value 1 in the block are in the same row. Because the block must contain the value 1, the row will have the value 1 in one of the intersecting cells. </p> <p> The other potential positions of the value 1 that are in the row but not in the block can therefore be removed. </p>",
            "rt" : "2.6",
            "sd" : "Pointing: Cells r2c4,r2c5: 1 in block and row"
        },
        {
            "ec" : {
                "1" : [42, 65, 66],
            },
            "hi" : [41, 44, 68, 71],
            "ht" : "<p> All the potential positions of the value 1 in two different columns are in the same two rows. Because the number of columns matches the number of rows, and because each column must contain the value 1; each row will have a 1 in one of the intersecting cells. </p> <p> The other potential positions of the value 1 that are in the rows but not in one of the columns can therefore be removed. </p>",
            "rt" : "3.2",
            "sd" : "X-Wing: Cells r5c6,r5c9,r8c6,r8c9: 1 in 2 columns and 2 rows"
        },
        {
            "di" : 73,
            "ht" : "<p> The cell r9c2 is the only possible position of the value 1 in the block. </p>",
            "rt" : "1.2",
            "sd" : "Hidden Single: r9c2: 1 in block"
        },
    ],
};

test("constructor", () => {
    const explainer = new SudokuExplainer(analysisPartial);
    expect(explainer.rating).toBe("3.2");
    expect(explainer.initialDigits.join("")).toBe(
        "900745360730006000645832719174658923069320070023007006496003007350070690207569034"
    );
    expect(explainer.finalDigits.join("")).toBe(
        "981745362732916548645832719174658923869321475523497186496183257358274691217569834"
    );
    expect(explainer.initialCandidates).toStrictEqual([
        "9",   "18",  "128",  "7",    "4",   "5",   "3",     "6",    "28",
        "7",   "3",   "128",  "19",   "19",  "6",   "2458",  "458",  "258",
        "6",   "4",   "5",    "8",    "3",   "2",   "7",     "1",    "9",
        "1",   "7",   "4",    "6",    "5",   "8",   "9",     "2",    "3",
        "58",  "6",   "9",    "3",    "2",   "14",  "1458",  "7",    "158",
        "58",  "2",   "3",    "149",  "19",  "7",   "1458",  "458",  "6",
        "4",   "9",   "6",    "12",   "18",  "3",   "1258",  "58",   "7",
        "3",   "5",   "18",   "124",  "7",   "14",  "6",     "9",    "128",
        "2",   "18",  "7",    "5",    "6",   "9",   "18",    "3",    "4",
    ]);

    const steps = explainer.steps;
    expect(Array.isArray(steps)).toBe(true);
    expect(steps.length).toBe(analysisPartial.ss.length);

    expect(steps[0].title).toBe("Hidden Single: r7c5: 8 in block");
    expect(steps[0].rating).toBe("1.2");
    expect(steps[0].digitIndex).toBe(58);
    expect(steps[0].digitValue).toBe('8');
    expect(typeof steps[0].html).toBe("string");
    expect(steps[0].highlightCell).toBe(undefined);
    expect(steps[0].eliminationsByCell).toBe(undefined);
    expect(steps[0].digits.join("")).toBe(explainer.initialDigits.join(""));
    expect(steps[0].candidates.join(',')).toBe(explainer.initialCandidates.join(','));

    expect(steps[1].title).toBe("Direct Hidden Pair: Cells r2c8,r6c8: 4,8 in column");
    expect(steps[1].rating).toBe("2.0");
    expect(steps[1].digitIndex).toBe(61);
    expect(steps[1].digitValue).toBe("5");
    expect(steps[1].highlightCell).toStrictEqual({16: true, 52: true});
    expect(steps[1].eliminationsByCell).toBe(undefined);
    expect(steps[1].digits.join("")).toBe(
        "900745360730006000645832719174658923069320070023007006496083007350070690207569034"
    );
    expect(steps[1].candidates).toStrictEqual([
        "9",   "18",  "128",  "7",    "4",   "5",   "3",     "6",    "28",
        "7",   "3",   "128",  "19",   "19",  "6",   "2458",  "458",  "258",
        "6",   "4",   "5",    "8",    "3",   "2",   "7",     "1",    "9",
        "1",   "7",   "4",    "6",    "5",   "8",   "9",     "2",    "3",
        "58",  "6",   "9",    "3",    "2",   "14",  "1458",  "7",    "158",
        "58",  "2",   "3",    "149",  "19",  "7",   "1458",  "458",  "6",
        "4",   "9",   "6",    "12",   "8",   "3",   "125",   "5",    "7",
        "3",   "5",   "18",   "124",  "7",   "14",  "6",     "9",    "128",
        "2",   "18",  "7",    "5",    "6",   "9",   "18",    "3",    "4",
    ]);

    expect(steps[2].title).toBe("Pointing: Cells r2c4,r2c5: 1 in block and row");
    expect(steps[2].rating).toBe("2.6");
    expect(steps[2].digitIndex).toBe(undefined);
    expect(steps[2].digitValue).toBe(undefined);
    expect(steps[2].highlightCell).toStrictEqual({12: true, 13: true});
    expect(steps[2].eliminationsByCell).toStrictEqual({"11": {"1": true}});
    expect(steps[2].digits.join("")).toBe(
        "900745360730006000645832719174658923069320070023007006496083057350070690207569034"
    );
    expect(steps[2].candidates).toStrictEqual([
        "9",   "18",  "128",  "7",    "4",   "5",   "3",     "6",    "28",
        "7",   "3",   "128",  "19",   "19",  "6",   "2458",  "48",   "258",
        "6",   "4",   "5",    "8",    "3",   "2",   "7",     "1",    "9",
        "1",   "7",   "4",    "6",    "5",   "8",   "9",     "2",    "3",
        "58",  "6",   "9",    "3",    "2",   "14",  "1458",  "7",    "158",
        "58",  "2",   "3",    "149",  "19",  "7",   "1458",  "48",   "6",
        "4",   "9",   "6",    "12",   "8",   "3",   "12",    "5",    "7",
        "3",   "5",   "18",   "124",  "7",   "14",  "6",     "9",    "128",
        "2",   "18",  "7",    "5",    "6",   "9",   "18",    "3",    "4",
    ]);

    expect(steps[3].title).toBe("X-Wing: Cells r5c6,r5c9,r8c6,r8c9: 1 in 2 columns and 2 rows");
    expect(steps[3].rating).toBe("3.2");
    expect(steps[3].digitIndex).toBe(undefined);
    expect(steps[3].digitValue).toBe(undefined);
    expect(steps[3].highlightCell).toStrictEqual({41: true, 44: true, 68: true, 71: true});
    expect(steps[3].eliminationsByCell).toStrictEqual({
        "42": {"1": true},
        "65": {"1": true},
        "66": {"1": true}}
    );
    expect(steps[3].digits.join("")).toBe(
        "900745360730006000645832719174658923069320070023007006496083057350070690207569034"
    );
    expect(steps[3].candidates).toStrictEqual([
        "9",   "18",  "128",  "7",    "4",   "5",   "3",     "6",    "28",
        "7",   "3",   "28",   "19",   "19",  "6",   "2458",  "48",   "258",
        "6",   "4",   "5",    "8",    "3",   "2",   "7",     "1",    "9",
        "1",   "7",   "4",    "6",    "5",   "8",   "9",     "2",    "3",
        "58",  "6",   "9",    "3",    "2",   "14",  "1458",  "7",    "158",
        "58",  "2",   "3",    "149",  "19",  "7",   "1458",  "48",   "6",
        "4",   "9",   "6",    "12",   "8",   "3",   "12",    "5",    "7",
        "3",   "5",   "18",   "124",  "7",   "14",  "6",     "9",    "128",
        "2",   "18",  "7",    "5",    "6",   "9",   "18",    "3",    "4",
    ]);

    expect(steps[4].title).toBe("Hidden Single: r9c2: 1 in block");
    expect(steps[4].rating).toBe("1.2");
    expect(steps[4].digitIndex).toBe(73);
    expect(steps[4].digitValue).toBe("1");
    expect(steps[4].highlightCell).toBe(undefined);
    expect(steps[4].eliminationsByCell).toBe(undefined);
    expect(steps[4].digits.join("")).toBe(
        "900745360730006000645832719174658923069320070023007006496083057350070690207569034"
    );
    expect(steps[4].candidates).toStrictEqual([
        "9",   "18",  "128",  "7",    "4",   "5",   "3",     "6",    "28",
        "7",   "3",   "28",   "19",   "19",  "6",   "2458",  "48",  "258",
        "6",   "4",   "5",    "8",    "3",   "2",   "7",     "1",    "9",
        "1",   "7",   "4",    "6",    "5",   "8",   "9",     "2",    "3",
        "58",  "6",   "9",    "3",    "2",   "14",  "458",   "7",    "158",
        "58",  "2",   "3",    "149",  "19",  "7",   "1458",  "48",  "6",
        "4",   "9",   "6",    "12",   "8",   "3",   "12",   "5",    "7",
        "3",   "5",   "8",    "24",   "7",   "14",  "6",     "9",    "128",
        "2",   "18",  "7",    "5",    "6",   "9",   "18",    "3",    "4",
    ]);
});
