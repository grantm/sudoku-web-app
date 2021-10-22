
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
