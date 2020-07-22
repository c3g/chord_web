import {FETCH_SYSTEM_LOGS, FETCH_SERVICE_LOGS} from "./actions";

export const logs = (
    state = {
        system: {
            isFetching: false,
            data: [],
        },
        service: {
            isFetching: false,
            data: [],
        },
    },
    action
) => {
    switch (action.type) {
        case FETCH_SYSTEM_LOGS.REQUEST:
            return {...state, system: {...state.system, isFetching: true}};
        case FETCH_SYSTEM_LOGS.RECEIVE:
            return {...state, system: {...state.system, data: action.data}};
        case FETCH_SYSTEM_LOGS.FINISH:
            return {...state, system: {...state.system, isFetching: false}};

        case FETCH_SERVICE_LOGS.REQUEST:
            return {...state, service: {...state.service, isFetching: true}};
        case FETCH_SERVICE_LOGS.RECEIVE:
            return {...state, service: {...state.service, data: action.data}};
        case FETCH_SERVICE_LOGS.FINISH:
            return {...state, service: {...state.service, isFetching: false}};

        default:
            return state;
    }
}
