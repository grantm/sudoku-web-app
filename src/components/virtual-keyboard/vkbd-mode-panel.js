import VkbdButtonIcon from './vkbd-button-icons';


function ModePanelButtonBackground({x, y, width, height}) {
    return (
        <rect className="button-bg" x={x} y={y} width={width} height={height} rx="15" />
    );
}

function ModePanelButtonForeground({x, y, width, height, icon, action, toolTipText, isActive, wantDoubleClick}) {
    const activeClass = isActive ? 'active' : '';
    return <>
        <VkbdButtonIcon btn={{icon: icon, left: x, top: y, activeClass: activeClass}} />
        <rect x={x} y={y} width={width} height={height} fill="transparent"
            data-key-value={action}
            data-want-double-click={wantDoubleClick}
        ><title>{toolTipText}</title></rect>
    </>;
}

export default function VkbdModePanel({modeButtons, inputMode, simplePencilMarking, toolTipText}) {
    const btnModeMatch = (simplePencilMarking && inputMode === 'inner') ? 'simple' : inputMode;
    const activeModeX = 790 - 160 * (modeButtons.length - modeButtons.indexOf(btnModeMatch) - 1);
    const buttonBackgrounds = modeButtons.map((btnMode, i) => {
        return <ModePanelButtonBackground
            key={btnMode}
            x={800 - 160 * (modeButtons.length - i - 1)}
            y={65}
            width={130}
            height={130}
        />;
    });
    const buttonForegrounds = modeButtons.map((btnMode, i) => {
        const btnInputMode = btnMode === 'simple' ? 'inner' : btnMode;
        return <ModePanelButtonForeground
            key={btnMode}
            x={800 - 160 * (modeButtons.length - i - 1)}
            y={65}
            width={130}
            height={130}
            icon={`mode-${btnMode}`}
            action={`input-mode-${btnInputMode}`}
            toolTipText={toolTipText[btnMode]}
            isActive={btnMode === btnModeMatch}
            wantDoubleClick={btnMode === 'color'}
        />;
    });
    return (
        <g className={`vkbd-mode-panel input-mode-${inputMode}`}>
            <rect className="background" x="40" y="40" width="920" height="180" rx="20" />
            <text
                className="mode-label"
                x="175"
                y="160"
                fontSize="68"
                textAnchor="middle"
            >
                Mode:
                <title>{toolTipText.mode}</title>
            </text>
            {buttonBackgrounds}
            <rect className="active-mode-bg"
                x={activeModeX} y="55" width="150" height="150" rx="15"
            />
            {buttonForegrounds}
        </g>
    );
}
