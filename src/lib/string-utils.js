
export function joinValues(joiner, ...values) {
    return values.filter(s => typeof(s) === 'string' && s !== '').join(joiner);
}


export function classList (...values) {
    return joinValues(' ', ...values);
}


export function twoDigits (n) {
    return `${n > 9 ? "" : "0"}${n}`;
}


export function secondsAsHMS (interval) {
    interval = Math.max(interval, 0);
    const seconds = interval % 60;
    const minutes = Math.floor(interval / 60) % 60;
    const minSec = `${twoDigits(minutes)}:${twoDigits(seconds)}`;
    return interval >= 3600
        ? `${Math.floor(interval / 3600)}:${minSec}`
        : minSec;
}


// These routines implement encoding/decoding a string of 81 characters that
// define a classic Sudoku as a shorter string in which each character encodes a
// digit *and* some number of trailing 0 digits (empty cells).
//
// Each character of the compressed form can be mapped to a 1 or 2 digit decimal
// number.  The units digit of that number encodes the digit itself and the 10s
// digit encodes the number of trailing 0s (which might be 0).
//
//   "0" => 0    "A" => 10    "K" => 20    "U" => 30    "e" => 40    "o" => 50
//   "1" => 1    "B" => 11    "L" => 21    "V" => 31    "f" => 41    "p" => 51
//   "2" => 2    "C" => 12    "M" => 22    "W" => 32    "g" => 42    "q" => 52
//   "3" => 3    "D" => 13    "N" => 23    "X" => 33    "h" => 43    "r" => 53
//   "4" => 4    "E" => 14    "O" => 24    "Y" => 34    "i" => 44    "s" => 54
//   "5" => 5    "F" => 15    "P" => 25    "Z" => 35    "j" => 45    "t" => 55
//   "6" => 6    "G" => 16    "Q" => 26    "a" => 36    "k" => 46    "u" => 56
//   "7" => 7    "H" => 17    "R" => 27    "b" => 37    "l" => 47    "v" => 57
//   "8" => 8    "I" => 18    "S" => 28    "c" => 38    "m" => 48    "w" => 58
//   "9" => 9    "J" => 19    "T" => 29    "d" => 39    "n" => 49    "x" => 59
//
// So for example "k" expands to "60000" (a "6" followed by 4 "0"s)
//
// Not sure who came up with this encoding technique - I first encountered it on
// the CTC web site.

export function expandPuzzleDigits(string) {
    return string.replace(/./g, c => {
        const n = c.charCodeAt(0) - (c > 'Z' ? 61 : c > '9' ? 55 : 48);
        return (n % 10) + '0'.repeat(n / 10);
    });
}


export function compressPuzzleDigits(digits) {
    return digits.replace(/\d0{0,5}/g, s => {
        const n = parseInt(s[0]) + 10 * s.length - 10;
        return n < 10 ? n : String.fromCharCode(n + (n < 36 ? 55 : 61));
    });
}
