import {FETCH_NODE_INFO} from "./actions";

export const nodeInfo = (
    state = {
        isFetching: false,
        data: {}
    },
    action
) => {
    switch (action.type) {
        case FETCH_NODE_INFO.REQUEST:
            return {...state, isFetching: true};
        case FETCH_NODE_INFO.RECEIVE:
            return {...state, data: action.data, isFetching: false};
        case FETCH_NODE_INFO.ERROR:
            return {...state, isFetching: false};
        default:
            return state;
    }
};
