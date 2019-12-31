import { useState, useRef, useCallback, useEffect } from 'react';

export default function useWindowSize (interval = 1000) {
    const [winSize, setWinSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const pending = useRef(null);

    const resizeHandler = useCallback(
        () => {
            pending.current = pending.current || setTimeout(
                () => {
                    setWinSize({
                        width: window.innerWidth,
                        height: window.innerHeight,
                    });
                    pending.current = null;
                },
                interval
            );
        },
        [pending, interval]
    );

    useEffect(
        () => {
            window.addEventListener('resize', resizeHandler);
            return () => {
                if (pending.current) {
                    clearTimeout(pending.current);
                }
                window.removeEventListener('resize', resizeHandler);
            }
        },
        [resizeHandler]
    );

    return winSize;
}
