import React, { useState, useCallback } from 'react';


const issueBaseUrl = "https://github.com/grantm/sudoku-web-app/issues";

function FeatureCheckBox ({name, allFeatureFlags, setFeatureFlag}) {
    const currValue = !!allFeatureFlags[name];
    return <label className="checkbox-wrapper">
        <input
            id={`feature-${name}`}
            className="toggle"
            type="checkbox"
            checked={currValue}
            onChange={() => setFeatureFlag(name, !currValue)}
        />
        <span className="indicator" />
    </label>;
}


function featureInputs(availableFeatures, allFeatureFlags, setFeatureFlag) {
    const featureRows = availableFeatures.map(f => {
        return (
            <tr key={f.name}>
                <td className="checkbox">
                    <FeatureCheckBox name={f.name} allFeatureFlags={allFeatureFlags} setFeatureFlag={setFeatureFlag} />
                </td>
                <td className="description">
                    <label htmlFor={`feature-${f.name}`}>{f.description}</label>
                </td>
                <td className="issue"><a target="_blank" rel="noopener noreferrer" href={`${issueBaseUrl}/${f.issueNumber}`}>#{f.issueNumber}</a></td>
            </tr>
        );
    });
    return (
        <table className="feature-list">
            <thead>
                <tr>
                    <th colSpan="2">Feature</th>
                    <th>Issue</th>
                </tr>
            </thead>
            <tbody>
                {featureRows}
            </tbody>
        </table>
    );
}


export default function ModalFeatures({modalState, modalHandler}) {
    const {availableFeatures, enabledFeatures} = modalState;
    const [allFeatureFlags, setAllFeatureFlags] = useState(enabledFeatures || {});
    const setFeatureFlag = useCallback(
        (name, newValue) => {
            console.log(`setting ${name} to ${newValue}`);
            const newFeatureFlags = { ...allFeatureFlags, [name]: newValue };
            setAllFeatureFlags(newFeatureFlags);
        },
        [allFeatureFlags]
    );
    const cancelHandler = () => modalHandler('goto-main-entry');
    const saveHandler = () => modalHandler({
        action: 'save-feature-flags',
        newFeatureFlags: allFeatureFlags,
    });
    const featureList = (availableFeatures && availableFeatures.length > 0)
        ? featureInputs(availableFeatures, allFeatureFlags, setFeatureFlag)
        : <p className="no-features">Sorry there are no features for testing at this time.</p>;
    return (
        <div className="modal features">
            <h1>Feature flags</h1>
            <p>This is where you can turn on and off features that are available
            for beta testing. If you discover a bug, please help by leaving a comment
            or reaction on the linked issue #.</p>
            {featureList}
            <div className="buttons">
                <button className="cancel" onClick={cancelHandler}>Cancel</button>
                <button className="primary" onClick={saveHandler}>Save</button>
            </div>
        </div>
    )
}
