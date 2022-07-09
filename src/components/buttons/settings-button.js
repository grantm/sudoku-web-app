import { useCallback } from 'react';

import ButtonIcon from '../svg-sprites/button-icon';

function SettingsButton ({menuHandler}) {
    const clickHandler = useCallback(
        e => {
            e.preventDefault();
            const menuAction = 'show-settings-modal';
            menuHandler(menuAction);
        },
        [menuHandler]
    );

    return (
        <button id="settings-button" type="button" title="Settings" onClick={clickHandler}>
            <ButtonIcon name="settings" />
        </button>
    )
}

export default SettingsButton;
