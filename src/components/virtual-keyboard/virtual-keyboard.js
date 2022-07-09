import { useRef, useCallback } from 'react';

import { keyboardLayout } from './vkbd-keyboard-layouts';
import VkbdButtonIcon from './vkbd-button-icons';
import VkbdModePanel from './vkbd-mode-panel';

import "./virtual-keyboard.css";


const stopPropagation = (e) => e.stopPropagation();
let seenTouchEvent = false;

function keyValueFromTouchEvent (e) {
    const t = (e.touches || [])[0];
    if (t) {
        const keyValue = t.target.dataset.keyValue;
        const wantDoubleClick = t.target.dataset.wantDoubleClick;
        return [keyValue, wantDoubleClick];
    }
    return [];
}

function buttonTouchHandler (e, touchState, inputHandler) {
    e.preventDefault();
    e.stopPropagation();
    seenTouchEvent = true;
    const eventType = e && e.type;  // Weirdly, have seen e === null here
    if (eventType === 'touchstart') {
        const [keyValue, wantDoubleClick] = keyValueFromTouchEvent(e);
        if (keyValue !== undefined) {
            touchState.current = {type: 'vkbdKeyPress', wantDoubleClick, keyValue, value: keyValue, source: 'touch'};
        }
    }
    else if (eventType === 'touchend') {
        inputHandler(touchState.current);
        touchState.current = null;
    }
}

function buttonClickHandler (e, inputHandler) {
    e.preventDefault();
    e.stopPropagation();
    if (seenTouchEvent) {
        return;
    }
    const {keyValue, wantDoubleClick} = e.target.dataset;
    if (keyValue !== undefined) {
        inputHandler({type: 'vkbdKeyPress', wantDoubleClick, keyValue, value: keyValue, source: 'click'});
    }
}

function VkbdButton({btn, inputMode, completed, toolTipText}) {
    let content;
    const isDigit = ('1' <= btn.text && btn.text <= '9');
    const wantDoubleClick = (btn.wantDoubleClick || isDigit) ? 'true' : null;
    if (btn.icon) {
        content = <VkbdButtonIcon btn={btn} />;
    }
    else if (inputMode === 'color' && btn.value.match(/^[1-9]$/)) {
        content = (
            <rect
                className={`vkbd-button-swatch color-code-${btn.value}`}
                x={btn.left + 30}
                y={btn.top + 30}
                width={btn.width - 60}
                height={btn.height - 60}
                rx="5"
            />
        );
    }
    else {
        content = (
            <text
                x={btn.left + btn.textX}
                y={btn.top + btn.textY}
                fontSize={btn.fontSize}
                textAnchor="middle"
            >
            {btn.text}
            </text>
        );
    }
    const toolTip = toolTipText[btn.value]
        ? <title>{toolTipText[btn.value]}</title>
        : null;
    return (
        <g className={`vkbd-button ${completed ? 'completed' : ''}`}>
            <rect
                className="vkbd-button-bg"
                x={btn.left}
                y={btn.top}
                width={btn.width}
                height={btn.height}
                rx="20"
            />
            {content}
            <rect
                x={btn.left}
                y={btn.top}
                width={btn.width}
                height={btn.height}
                fill="transparent"
                data-key-value={btn.value}
                data-want-double-click={wantDoubleClick}
                onMouseDown={stopPropagation}
            >{toolTip}</rect>
        </g>
    );
}

function VkbdButtonSet({buttonDefs, inputMode, completedDigits, toolTipText}) {
    const buttons = buttonDefs.map(btn => {
        const completed = completedDigits[btn.value];
        return (
            <VkbdButton
                key={btn.value}
                btn={btn}
                inputMode={inputMode}
                completed={completed}
                toolTipText={toolTipText}
            />
        );
    });
    return buttons;
}

export default function VirtualKeyboard({dimensions, inputMode, completedDigits, flipNumericKeys, inputHandler, simplePencilMarking}) {
    const touchState = useRef(null);
    const rawTouchHandler = useCallback(e => buttonTouchHandler(e, touchState, inputHandler), [inputHandler]);
    const rawClickHandler = useCallback(e => buttonClickHandler(e, inputHandler), [inputHandler]);
    const layout = keyboardLayout(dimensions, flipNumericKeys);
    const toolTipText = {
        mode: 'Input modes - shortcuts: Z, X, C & V',
        digit: 'Enter a digit',
        outer: 'Add an "outer" pencil-mark - Shift+Digit',
        inner: 'Add an "inner" pencil-mark - Ctrl+Digit',
        simple: 'Add a pencil-mark - Shift+Digit',
        color: 'Colour cell background, double-click to clear',
        undo: 'Undo last change - Ctrl+Z or [',
        redo: 'Redo last change - Ctrl+Y or ]',
        restart: 'Restart the puzzle',
        delete: 'Delete digits, pencil-marks & color highlights',
        check: 'Check grid for conflicting digits',
    };
    const modeButtons = simplePencilMarking
        ? ['digit', 'simple', 'color']
        : ['digit', 'outer', 'inner', 'color'];
    const currMode = (simplePencilMarking && inputMode === 'outer')
        ? 'inner'
        : inputMode;
    return (
        <div className="vkbd"
            onTouchStart={rawTouchHandler}
            onTouchEnd={rawTouchHandler}
            onClick={rawClickHandler}
            onMouseDown={stopPropagation}
        >
            <svg version="1.1"
                style={{width: dimensions.vkbdWidth}}
                viewBox={`0 0 ${layout.width} ${layout.height}`}
            >
                <rect className="vkbd-background" width="100%" height="100%" rx="40" />
                <VkbdModePanel
                    modeButtons={modeButtons}
                    simplePencilMarking={simplePencilMarking}
                    inputMode={currMode}
                    toolTipText={toolTipText}
                />
                <VkbdButtonSet
                    buttonDefs={layout.buttonDefs}
                    inputMode={currMode}
                    completedDigits={completedDigits}
                    toolTipText={toolTipText}
                />
            </svg>
        </div>
    )
}
