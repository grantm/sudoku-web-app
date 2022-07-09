import { useState, useEffect } from 'react';

import ButtonIcon from '../svg-sprites/button-icon';

let fsApi = null;

function FullscreenButton () {
    fsApi ||= determineFullscreenApi();
    const [fsEnabled, setFsEnabled] = useState(fsApi && !!document[fsApi.ELEMENT_PROP_NAME]);
    const title = fsEnabled ? 'Exit full screen' : 'Full screen';
    const clickHandler = (e) => {
        e.currentTarget.blur();
        return !!document[fsApi.ELEMENT_PROP_NAME]
            ? document[fsApi.EXIT_METHOD_NAME]()
            : document.body[fsApi.ENTER_METHOD_NAME]();
    };
    useEffect(
        () => {
            const resizeHandler = (e) => { setFsEnabled(!!document[fsApi.ELEMENT_PROP_NAME]); };
            document.body.addEventListener('fullscreenchange', resizeHandler);
            return () => {
                document.body.removeEventListener('fullscreenchange', resizeHandler);
            }
        },
        [fsApi, setFsEnabled]
    );
    return fsApi
        ? (
            <button id="fullscreen-button" type="button" title={title} onClick={clickHandler}>
                {fsEnabled ? <ButtonIcon name="exit-fullscreen" /> : <ButtonIcon name="enter-fullscreen" />}
            </button>
        )
        : null;
}

function determineFullscreenApi() {
    if (document.body.requestFullscreen) {
        return {
            ELEMENT_PROP_NAME: "fullscreenElement",
            ENTER_METHOD_NAME: "requestFullscreen",
            EXIT_METHOD_NAME: "exitFullscreen",
        }
    }
    else if (document.body.webkitRequestFullscreen) {
        return {
            ELEMENT_PROP_NAME: "webkitFullscreenElement",
            ENTER_METHOD_NAME: "webkitRequestFullscreen",
            EXIT_METHOD_NAME: "webkitExitFullscreen",
        }
    }
    else {
        return null;
    }
}

export default FullscreenButton;
