import {SIGN_IN_URL} from "../constants";

export const urlPath = url => (new URL(url)).pathname;

// Allow embedding of CHORD_URL at build time
export const BASE_PATH = process.env.CHORD_URL ? urlPath(process.env.CHORD_URL) : "/";
export const withBasePath = path => `${BASE_PATH}${(path.length > 0 && path[0] === "/" ? path.slice(1) : path)}`;

export const signInURLWithRedirect = () => withBasePath(`${SIGN_IN_URL}?redirect=${window.location.href}`);
