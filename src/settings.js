const ENV = (process || {}).env || {};
const SETTINGS_FALSE_VALUES = ["", "false"];

const isFalsey = (ev, df) => !SETTINGS_FALSE_VALUES.includes(
    (ev === undefined ? df : ev).toString().toLocaleLowerCase().trim());

// Setting toggle to control whether the discovery/peering aspects are present
// in the deployment of the front end. False-y values include an empty string,
// "false", or "0".
export const FEDERATION_MODE = isFalsey(ENV.BENTO_FEDERATION_MODE, true);

console.log(FEDERATION_MODE, ENV, process.env.CHORD_URL, process.env.BENTO_FEDERATION_MODE, process.env);
