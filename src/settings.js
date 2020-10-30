const ENV = (process || {}).env || {};
const SETTINGS_FALSE_VALUES = ["", "false"];

// TODO: System for truthy defaults

const isFalsey = ev => !SETTINGS_FALSE_VALUES.includes((ev || "").toString().toLocaleLowerCase().trim());

// Setting toggle to control whether the discovery/peering aspects are present
// in the deployment of the front end. False-y values include an empty string,
// "false", or "0".
export const FEDERATION_MODE = isFalsey(ENV.BENTO_FEDERATION_MODE);
