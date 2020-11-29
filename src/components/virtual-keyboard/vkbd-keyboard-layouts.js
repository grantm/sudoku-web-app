
const landscapePlayBaseButton = {
    width: 200,
    height: 200,
    textX: 100,
    textY: 160,
    fontSize: 170,
};

const landscapePlayButtonDefs = [
    {
        value: "1",
        left: 40,
        top: 250,
    },
    {
        value: "2",
        left: 280,
        top: 250,
    },
    {
        value: "3",
        left: 520,
        top: 250,
    },
    {
        value: "4",
        left: 40,
        top: 490,
    },
    {
        value: "5",
        left: 280,
        top: 490,
    },
    {
        value: "6",
        left: 520,
        top: 490,
    },
    {
        value: "7",
        left: 40,
        top: 730,
    },
    {
        value: "8",
        left: 280,
        top: 730,
    },
    {
        value: "9",
        left: 520,
        top: 730,
    },
    {
        value: "delete",
        text: "Delete",
        left: 40,
        top: 970,
        width: 440,
        textX: 222,
        textY: 130,
        fontSize: 90,
    },
    {
        value: "check",
        text: "Check",
        left: 520,
        top: 970,
        width: 440,
        textX: 222,
        textY: 130,
        fontSize: 90,
    },
    {
        value: "undo",
        icon: "undo",
        left: 760,
        top: 250,
    },
    {
        value: "redo",
        icon: "redo",
        left: 760,
        top: 490,
    },
    {
        value: "restart",
        icon: "restart",
        left: 760,
        top: 730,
    },
];

const landscapeFlipMapping = [
    { top: 730 },
    { top: 730 },
    { top: 730 },
    null,
    null,
    null,
    { top: 250 },
    { top: 250 },
    { top: 250 },
    null,
    null,
    null,
    null,
    null,
];

const portraitPlayBaseButton = {
    width: 200,
    height: 200,
    textX: 100,
    textY: 160,
    fontSize: 170,
};

const portraitPlayButtonDefs = [
    {
        value: "1",
        left: 40,
        top: 250,
    },
    {
        value: "2",
        left: 280,
        top: 250,
    },
    {
        value: "3",
        left: 520,
        top: 250,
    },
    {
        value: "4",
        left: 40,
        top: 490,
    },
    {
        value: "5",
        left: 280,
        top: 490,
    },
    {
        value: "6",
        left: 520,
        top: 490,
    },
    {
        value: "7",
        left: 40,
        top: 730,
    },
    {
        value: "8",
        left: 280,
        top: 730,
    },
    {
        value: "9",
        left: 520,
        top: 730,
    },
    {
        value: "delete",
        text: "Delete",
        left: 760,
        top: 730,
        width: 440,
        textX: 222,
        textY: 130,
        fontSize: 90,
    },
    {
        value: "check",
        icon: "check",
        left: 760,
        top: 250,
        width: 200,
        textX: 222,
        textY: 130,
        fontSize: 90,
    },
    {
        value: "undo",
        icon: "undo",
        left: 760,
        top: 490,
    },
    {
        value: "redo",
        icon: "redo",
        left: 1000,
        top: 490,
    },
    {
        value: "restart",
        icon: "restart",
        left: 1000,
        top: 250,
    },
];

const portraitFlipMapping = [
    { top: 730 },
    { top: 730 },
    { top: 730 },
    null,
    null,
    null,
    { top: 250 },
    { top: 250 },
    { top: 250 },
    null,
    null,
    null,
    null,
    null,
];

export function keyboardLayout(dimensions, flipNumericKeys) {
    const layout = {};

    if (dimensions.orientation === 'portrait') {
        layout.width = 1240;
        layout.height = 970;

        layout.buttonDefs = portraitPlayButtonDefs.map(def => {
            const btn = { ...portraitPlayBaseButton, ...def };
            btn.text = btn.text || btn.value;
            return btn;
        });

        layout.flipMapping = portraitFlipMapping;
    }
    else {
        layout.width = 1000;
        layout.height = 1210;

        layout.buttonDefs = landscapePlayButtonDefs.map(def => {
            const btn = { ...landscapePlayBaseButton, ...def };
            btn.text = btn.text || btn.value;
            return btn;
        });

        layout.flipMapping = landscapeFlipMapping;
    }

    if (flipNumericKeys && layout.flipMapping) {
        layout.buttonDefs = layout.buttonDefs.map((def, i) => {
            const flipped = layout.flipMapping[i];
            return Object.assign({}, def, flipped);
        });
    }

    return layout;
}
