import {simpleDeepCopy} from "../../utils";

import {FETCH_SERVICE_DATA_TYPES} from "../services/actions";

import {
    TOGGLE_DISCOVERY_SCHEMA_MODAL,

    FETCH_SEARCH,
    SELECT_SEARCH,

    SELECT_DISCOVERY_SERVICE_DATA_TYPE,
    CLEAR_DISCOVERY_SERVICE_DATA_TYPE,
    UPDATE_DISCOVERY_SEARCH_FORM
} from "./actions";

export const discovery = (
    state = {
        isFetching: false,
        schemaModalShown: false,
        selectedServiceID: null,
        selectedDataTypeID: null,
        searchFormsByServiceAndDataTypeID: {},
        searches: [],
        searchesByServiceAndDataTypeID: {},
        selectedSearchByServiceAndDataTypeID: {}
    },
    action
) => {
    switch (action.type) {
        case FETCH_SERVICE_DATA_TYPES.RECEIVE:
            return {
                ...state,
                searchFormsByServiceAndDataTypeID: {
                    ...state.searchFormsByServiceAndDataTypeID,
                    [action.serviceInfo.id]: Object.fromEntries(action.data.map(d =>
                        [d.id, (state.searchFormsByServiceAndDataTypeID[action.serviceInfo.id] || {})[d.id] || {}]))
                }
            };

        case TOGGLE_DISCOVERY_SCHEMA_MODAL:
            return {...state, schemaModalShown: !state.schemaModalShown};

        case FETCH_SEARCH.REQUEST:
            return {...state, isFetching: true};

        case FETCH_SEARCH.RECEIVE:
            return {
                ...state,
                isFetching: false,
                searches: [...state.searches, action.data], // Add search to search history
                searchesByServiceAndDataTypeID: {
                    ...state.searchesByServiceAndDataTypeID,
                    [action.serviceInfo.id]: {
                        ...(state.searchesByServiceAndDataTypeID[action.serviceInfo.id] || {}),
                        [action.dataTypeID]: [
                            ...((state.searchesByServiceAndDataTypeID[action.serviceInfo.id] || {})[action.dataTypeID]
                                || []),
                            action.data
                        ]
                    }
                },
                lastUpdated: action.receivedAt
            };

        case FETCH_SEARCH.ERROR:
            return {...state, isFetching: false};

        case SELECT_SEARCH:
            return {
                ...state,
                selectedSearchByServiceAndDataTypeID: {
                    ...state.selectedSearchByServiceAndDataTypeID,
                    [action.serviceInfo.id]: {
                        ...(state.selectedSearchByServiceAndDataTypeID[action.serviceInfo.id] || {}),
                        [action.dataTypeID]: action.searchIndex
                    }
                }
            };

        case SELECT_DISCOVERY_SERVICE_DATA_TYPE:
            return {
                ...state,
                selectedServiceID: action.serviceInfo.id,
                selectedDataTypeID: action.dataTypeID
            };

        case CLEAR_DISCOVERY_SERVICE_DATA_TYPE:
            return {
                ...state,
                selectedServiceID: null,
                selectedDataTypeID: null
            };

        case UPDATE_DISCOVERY_SEARCH_FORM:
            return {
                ...state,
                searchFormsByServiceAndDataTypeID: {
                    ...state.searchFormsByServiceAndDataTypeID,
                    [action.serviceInfo.id]: {
                        ...state.searchFormsByServiceAndDataTypeID[action.serviceInfo.id],
                        [action.dataTypeID]: simpleDeepCopy(action.fields) // TODO: Hack-y deep clone
                    }
                }
            };

        default:
            return state;
    }
};
