import { joinValues, classList, twoDigits, secondsAsHMS } from './string-utils';


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
