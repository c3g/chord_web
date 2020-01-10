import fetch from "cross-fetch";
import {message} from "antd";

import "antd/es/message/style/css";


export const basicAction = t => () => ({type: t});

export const createNetworkActionTypes = name => ({
    REQUEST: `${name}.REQUEST`,
    RECEIVE: `${name}.RECEIVE`,
    ERROR: `${name}.ERROR`
});

export const createFlowActionTypes = name => ({
    BEGIN: `${name}.BEGIN`,
    END: `${name}.END`,
    TERMINATE: `${name}.TERMINATE`
});


const _networkAction = (fn, ...args) =>
    async (dispatch, getState) => {
        let fnResult = fn(...args);
        if (typeof fnResult === "function") {
            // Needs dispatch / getState, resolve those.
            fnResult = fnResult(dispatch, getState);
        }

        const {types, params, url, req, err, onSuccess} = fnResult;
        let {parse} = fnResult;
        if (!parse) parse = async r => await r.json();

        await dispatch({type: types.REQUEST, ...params});
        try {
            const response = await fetch(url, req);

            if (response.ok) {
                const data = response.status === 204 ? null : await parse(response);
                await dispatch({
                    type: types.RECEIVE,
                    ...params,
                    ...(data === null ? {} : {data}),
                    receivedAt: Date.now()
                });
                if (onSuccess) await onSuccess(data);
            } else {
                if (err) {
                    console.error(response, err);
                    message.error(err);
                }
                await dispatch({type: types.ERROR, ...params});
            }
        } catch (e) {
            if (err) {
                console.error(e, err);
                message.error(err);
            }
            await dispatch({type: types.ERROR, ...params});
        }
    };

// Curried version
export const networkAction = fn => (...args) => _networkAction(fn, ...args);


export const beginFlow = types => async dispatch => await dispatch({type: types.BEGIN});
export const endFlow = types => async dispatch => await dispatch({type: types.END});
export const terminateFlow = types => async dispatch => await dispatch({type: types.TERMINATE});
