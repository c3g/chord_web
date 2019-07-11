import {combineReducers} from "redux";
import {
    REQUEST_SERVICES,
    RECEIVE_SERVICES,
    INVALIDATE_SERVICES,
    REQUEST_SERVICE_STATUS,
    RECEIVE_SERVICE_STATUS,
    INVALIDATE_SERVICE_STATUS
} from "./actions";

const services = (
    state={
        isFetching: false,
        didInvalidate: false,
        items: []
    },
    action
) => {
    switch (action.type) {
        case REQUEST_SERVICES:
            return Object.assign({}, state, {
                isFetching: true,
                didInvalidate: false
            });
        case RECEIVE_SERVICES:
            return Object.assign({}, state, {
                isFetching: false,
                didInvalidate: false,
                items: action.services,
                lastUpdated: action.receivedAt
            });
        case INVALIDATE_SERVICES:
            return Object.assign({}, state, {
                didInvalidate: true
            });
        default:
            return state;
    }
};

const serviceStatus = (
    state={
        isFetching: false,
        didInvalidate: false,
        status: {}
    },
    action
) => {
    switch (action.type) {
        case REQUEST_SERVICE_STATUS:
            return Object.assign({}, state, {
                isFetching: true,
                didInvalidate: false
            });
        case RECEIVE_SERVICE_STATUS:
            return Object.assign({}, state, {
                isFetching: false,
                didInvalidate: false,
                status: {...action.status},
                lastUpdated: action.receivedAt
            });
        case INVALIDATE_SERVICE_STATUS:
            return Object.assign({}, state, {
                didInvalidate: true
            });
        default:
            return state;
    }
};

const rootReducer = combineReducers({
    services,
    serviceStatus
});

export default rootReducer;
