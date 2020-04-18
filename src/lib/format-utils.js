
function twoDigits (n) {
    return n > 9 ? ('' + n) : ('0' + n);
}

function secondsAsHMS (interval) {
    interval = Math.max(interval, 0);
    const seconds = interval % 60;
    const minutes = Math.floor(interval / 60) % 60;
    const minSec = `${twoDigits(minutes)}:${twoDigits(seconds)}`;
    return interval >= 3600
        ? `${Math.floor(interval / 3600)}:${minSec}`
        : minSec;
}

export { secondsAsHMS };
