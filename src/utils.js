import PropTypes from "prop-types";

import fetch from "cross-fetch";
import {message} from "antd";

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


const _networkAction = (types, params, url, req = {}, err = null, aa = null) => async dispatch => {
    await dispatch({type: types.REQUEST, ...params});
    try {
        const response = await fetch(url, req);

        if (response.ok) {
            const data = await response.json();
            await dispatch({type: types.RECEIVE, ...params, data, receivedAt: Date.now()});
            if (aa) await dispatch(aa());
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

export const networkAction = fn => (...args) => {
    const {types, params, url, req, err, afterAction} = fn(...args);
    return _networkAction(types, params || {}, url, req || {}, err || null,
        afterAction || null);
};


export const beginFlow = types => async dispatch => await dispatch({type: types.BEGIN});
export const endFlow = types => async dispatch => await dispatch({type: types.END});
export const terminateFlow = types => async dispatch => await dispatch({type: types.TERMINATE});


export const simpleDeepCopy = o => JSON.parse(JSON.stringify(o));

// Gives components which include this in their state to props connection access to the drop box and loading status.
export const dropBoxTreeStateToPropsMixin = state => ({
    tree: state.dropBox.tree,
    treeLoading: state.dropBox.isFetching
});

// Any components which include dropBoxTreeStateToPropsMixin should include this as well in their prop types.
export const dropBoxTreeStateToPropsMixinPropTypes = {
    tree: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        path: PropTypes.string
    })),  // TODO: This is going to change
    treeLoading: PropTypes.bool
};

// Gives components which include this in their state to props connection access to workflows and loading status.
export const workflowsStateToPropsMixin = state => ({
    workflows: Object.entries(state.serviceWorkflows.workflowsByServiceID)
        .filter(([_, s]) => !s.isFetching)
        .flatMap(([serviceID, s]) => Object.entries(s.workflows.ingestion).map(([k, v]) => ({
            ...v,
            id: k,
            serviceID
        }))),
    workflowsLoading: state.services.isFetchingAll || state.serviceWorkflows.isFetchingAll
});

// Prop types object shape for a single workflow object.
export const workflowPropTypesShape = PropTypes.shape({
    id: PropTypes.string,
    serviceID: PropTypes.string,

    // "Real" properties
    name: PropTypes.string,
    description: PropTypes.string,
    data_types: PropTypes.arrayOf(PropTypes.string),
    inputs: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.string,
        id: PropTypes.string,
        extensions: PropTypes.arrayOf(PropTypes.string)  // File type only
    })),
    outputs: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.string,
        value: PropTypes.string
    }))
});

// Any components which include workflowStateToPropsMixin should include this as well in their prop types.
export const workflowsStateToPropsMixinPropTypes = {
    workflows: PropTypes.arrayOf(workflowPropTypesShape),
    workflowsLoading: PropTypes.bool
};
