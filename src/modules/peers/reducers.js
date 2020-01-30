import {FETCH_PEERS} from "./actions";

export const peers = (
    state = {
        isFetching: false,
        items: []
    },
    action
) => {
    switch (action.type) {
        case FETCH_PEERS.REQUEST:
            return {...state, isFetching: true};
        case FETCH_PEERS.RECEIVE:
            return {...state, items: action.data.peers.sort()};
        case FETCH_PEERS.FINISH:
            return {...state, isFetching: false};

        default:
            return state;
    }
};
