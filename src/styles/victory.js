// noinspection JSUnusedGlobalSymbols
export const VICTORY_PIE_PROPS = {
    standalone: false,
    innerRadius: ({radius}) => radius * (7/10),
    // labelRadius: ({innerRadius, radius}) => innerRadius({radius}) + (radius - innerRadius({radius})) / 2,
    // style: {labels: {fill: "white", textAnchor: "middle"}},
    padding: {left: 120, right: 120, top: 40, bottom: 40},
    labelPadding: 20,
    height: 250,
    labels: ({datum}) => `${datum.x}: ${datum.y}`,
    style: {labels: {fontFamily: "monospace"}},
};

export const VICTORY_PIE_LABEL_PROPS = {
    textAnchor: "middle",
    x: 200,
    y: 125,
    style: {fontFamily: "monospace"}
};

// noinspection JSUnusedGlobalSymbols
export const VICTORY_LABEL_PROPS = {
    padding: {left: 120, right: 120, top: 40, bottom: 40},
    height: 250,
    labels: ({datum}) => datum.y.toString(),
    style: {labels: {fontFamily: "monospace"}},
};

export const VICTORY_BAR_TITLE_PROPS = {
    textAnchor: "middle",
    x: 225,
    y: 20,
    style: {fontFamily: "monospace"},
};
