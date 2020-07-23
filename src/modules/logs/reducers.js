import {FETCH_SYSTEM_LOGS, FETCH_SERVICE_LOGS} from "./actions";
import {arrayToObjectByProperty} from "../../utils/misc";
import {combineReducers} from "redux";

const byService = actionData => arrayToObjectByProperty(actionData, "service");

const logReducerFactory = actionTypes => (
    state = {
        isFetching: false,
        items: [],
        itemsByArtifact: {},
    },
    action
) => {
    switch (action.type) {
        case actionTypes.REQUEST:
            return {...state, isFetching: true};
        case actionTypes.RECEIVE:
            return {
                ...state,
                items: action.data,
                itemsByArtifact: byService(action.data),
            };
        case actionTypes.FINISH:
            return {...state, isFetching: false};

        default:
            return state;
    }
};

export const logs = combineReducers({
    service: logReducerFactory(FETCH_SERVICE_LOGS),
    system: logReducerFactory(FETCH_SYSTEM_LOGS),
});
