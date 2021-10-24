import {
    joinValues, classList, twoDigits, secondsAsHMS,
    expandPuzzleDigits, compressPuzzleDigits
} from './string-utils';


const puzzleStrings = [
    {
        expanded: "000309007001060040000010003206003100000020000008700905600070000010090800700508000",
        compressed: "KDTRBQsV3CQ3p0q08RJ5avLJSRFc",
    },
    {
        expanded: "300054009000200700090780000900301260506000407073405001000042070008006000100830004",
        compressed: "X5OdMbJ7mTD12GFaEH73EPf4CbSaL8X4"
    },
    {
        expanded: "710608059000109000300000002009050400005203600073000120400000008000987000000000000",
        compressed: "7BGI5dBdrAMJFi5C3a7X1CsAc98vo0"
    },
    {
        expanded: "000400080000090701100008400020007500570603098003200010007100003806070000030004000",
        compressed: "KYwJH1f8YW7P5HGD9S3WV7f3IGvXY",
    },
    {
        expanded: "700040000016500700059003060000410005030000010100065000060200970002007540000090006",
        compressed: "bs16Pb5TDk4VFrBV6jGM9bM75sd6",
    },
    {
        expanded: "000000130290003000503006004000004980000708000078200000100900506000600072025000000",
        compressed: "o1D2dXFNQs49mHm78qLTFaa7C2t0",
    },
];

test("joinValues()",() => {
    expect(joinValues(",", "a", "b", "c")).toBe("a,b,c");
    expect(joinValues("", "a", "b", "c")).toBe("abc");
    expect(joinValues("", "a", undefined, "b")).toBe("ab");
    expect(joinValues("", "a", null, "b")).toBe("ab");
    expect(joinValues("", "a", false, "b")).toBe("ab");
    expect(joinValues("", "a", true, "b")).toBe("ab");
    expect(joinValues("", "a", {}, "b")).toBe("ab");
    expect(joinValues(" ", "a", "", "b")).toBe("a b");
});


test("classList()", () => {
    expect(classList()).toBe("");
    expect(classList("open")).toBe("open");
    expect(classList("option", "checked")).toBe("option checked");
    expect(classList(
        "one",
        false && "two",
        undefined && "three",
        true && "four"
    )).toBe("one four");
});


test("twoDigits()", () => {
    expect(twoDigits(0)).toBe("00");
    expect(twoDigits(10)).toBe("10");
    expect(twoDigits(99)).toBe("99");
    expect(twoDigits(999)).toBe("999");
});


test("secondsAsHMS()", () => {
    expect(secondsAsHMS(0)).toBe("00:00");
    expect(secondsAsHMS(1)).toBe("00:01");
    expect(secondsAsHMS(59)).toBe("00:59");
    expect(secondsAsHMS(60)).toBe("01:00");
    expect(secondsAsHMS(61)).toBe("01:01");
    expect(secondsAsHMS(119)).toBe("01:59");
    expect(secondsAsHMS(120)).toBe("02:00");
    expect(secondsAsHMS(3599)).toBe("59:59");
    expect(secondsAsHMS(9296)).toBe("2:34:56");
    expect(secondsAsHMS(24872)).toBe("6:54:32");
    expect(secondsAsHMS(201355)).toBe("55:55:55");
    expect(secondsAsHMS(2001355)).toBe("555:55:55");
});


test("expandPuzzleDigits()", () => {
    const complete = "123456789456789123789123456234567891567891234891234567345678912678912345912345678";
    expect(expandPuzzleDigits(complete)).toBe(complete);
    expect(expandPuzzleDigits("1BLVfp")).toBe("110100100010000100000");
    expect(expandPuzzleDigits("9JTdnx")).toBe("990900900090000900000");
    puzzleStrings.forEach((p) => {
        expect(
            p.compressed + " => " + expandPuzzleDigits(p.compressed)
        ).toBe(
            p.compressed + " => " + p.expanded
        )
    });
});


test("compressPuzzleDigits()", () => {
    const complete = "123456789456789123789123456234567891567891234891234567345678912678912345912345678";
    expect(compressPuzzleDigits(complete)).toBe(complete);
    expect(compressPuzzleDigits("110100100010000100000")).toBe("1BLVfp");
    expect(compressPuzzleDigits("990900900090000900000")).toBe("9JTdnx");
    puzzleStrings.forEach((p) => {
        expect(
            p.expanded + " => " + compressPuzzleDigits(p.expanded)
        ).toBe(
            p.expanded + " => " + p.compressed
        )
    });
});
