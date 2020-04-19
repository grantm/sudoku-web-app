import React, { useState, useCallback } from 'react';

function CheckBoxSetting ({name, text, allSettings, setSetting}) {
    const currValue = !!allSettings[name];
    return (
        <li>
            <label>
                {text}
                <input type="checkbox"
                    checked={currValue}
                    onChange={() => setSetting(name, !currValue)}
                />
                <span className="indicator" />
            </label>
        </li>
    );
}

export default function ModalSettings({modalHandler, modalState}) {
    const [allSettings, setAllSettings] = useState(modalState.currentSettings);
    const setSetting = useCallback(
        (name, newValue) => {
            const newSettings = Object.assign({}, allSettings, { [name]: newValue });
            setAllSettings(newSettings);
        },
        [allSettings]
    );
    const cancelHandler = () => modalHandler('cancel');
    const saveHandler = () => modalHandler({
        action: 'save-settings',
        newSettings: allSettings,
    });
    return (
        <div className="modal settings">
            <h1>Settings</h1>
            <ul className="settings-list">
                <CheckBoxSetting
                    name="dark-mode"
                    text="Dark mode"
                    allSettings={allSettings}
                    setSetting={setSetting}
                />
                <CheckBoxSetting
                    name="show-timer"
                    text="Show timer"
                    allSettings={allSettings}
                    setSetting={setSetting}
                />
                <CheckBoxSetting
                    name="highlight-matches"
                    text="Highlight matching digits"
                    allSettings={allSettings}
                    setSetting={setSetting}
                />
                <CheckBoxSetting
                    name="highlight-conflicts"
                    text="Highlight conflicting digits"
                    allSettings={allSettings}
                    setSetting={setSetting}
                />
                <CheckBoxSetting
                    name="autoclean-pencilmarks"
                    text="Auto-clean pencil marks"
                    allSettings={allSettings}
                    setSetting={setSetting}
                />
            </ul>
            <div className="buttons">
                <button className="cancel" onClick={cancelHandler}>Cancel</button>
                <button className="primary" onClick={saveHandler}>Save</button>
            </div>
        </div>
    )
}
