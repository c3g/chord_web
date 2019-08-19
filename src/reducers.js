import {combineReducers} from "redux";
import {
    REQUEST_SERVICES,
    RECEIVE_SERVICES,

    REQUEST_SERVICE_METADATA,
    RECEIVE_SERVICE_METADATA,

    REQUEST_SERVICE_DATA_TYPES,
    RECEIVE_SERVICE_DATA_TYPES,

    TOGGLE_DISCOVERY_SCHEMA_MODAL,

    REQUEST_SEARCH,
    RECEIVE_SEARCH,
    SELECT_SEARCH,
    HANDLE_SEARCH_ERROR,

    SELECT_DISCOVERY_SERVICE_DATA_TYPE,
    CLEAR_DISCOVERY_SERVICE_DATA_TYPE,
    UPDATE_DISCOVERY_SEARCH_FORM
} from "./actions";

const services = (
    state = {
        isFetching: false,
        items: [],
        itemsByID: {}
    },
    action
) => {
    switch (action.type) {
        case REQUEST_SERVICES:
            return Object.assign({}, state, {
                isFetching: true,
            });

        case RECEIVE_SERVICES:
            return Object.assign({}, state, {
                isFetching: false,
                items: action.services,
                itemsByID: Object.assign({}, state.itemsByID, ...action.services.map(s => ({[s.id]: s}))),
                lastUpdated: action.receivedAt
            });

        default:
            return state;
    }
};

const serviceMetadata = (
    state = {
        isFetching: false,
        didInvalidate: false,
        metadata: {}
    },
    action
) => {
    switch (action.type) {
        case REQUEST_SERVICE_METADATA:
            return Object.assign({}, state, {
                isFetching: true,
            });

        case RECEIVE_SERVICE_METADATA:
            return Object.assign({}, state, {
                isFetching: false,
                metadata: {...action.metadata},
                lastUpdated: action.receivedAt
            });

        default:
            return state;
    }
};

const serviceDataTypes = (
    state = {
        isFetching: false,
        dataTypes: {},
        dataTypesByServiceAndDataTypeID: {}
    },
    action
) => {
    switch (action.type) {
        case REQUEST_SERVICE_DATA_TYPES:
            return Object.assign({}, state, {
                isFetching: true,
            });

        case RECEIVE_SERVICE_DATA_TYPES:
            return Object.assign({}, state, {
                isFetching: false,
                dataTypes: {
                    ...state.dataTypes,
                    [action.service]: action.dataTypes
                },
                dataTypesByServiceAndDataTypeID: {
                    ...state.dataTypesByServiceAndDataTypeID,
                    [action.service]: Object.assign({}, ...action.dataTypes.map(d => ({[d.id]: d})))
                },
                lastUpdated: action.receivedAt
            });

        default:
            return state;
    }
};

const discovery = (
    state = {
        isFetching: false,
        modalShown: false,
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
        case RECEIVE_SERVICE_DATA_TYPES:
            return Object.assign({}, state, {
                searchFormsByServiceAndDataTypeID: {
                    ...state.searchFormsByServiceAndDataTypeID,
                    [action.service]: {
                        ...Object.assign({}, ...action.dataTypes.map(d => ({
                            [d.id]: (state.searchFormsByServiceAndDataTypeID[action.service] || {})[d.id] || {}
                        })))
                    }
                }
            });

        case TOGGLE_DISCOVERY_SCHEMA_MODAL:
            return Object.assign({}, state, {
                modalShown: !state.modalShown
            });

        case REQUEST_SEARCH:
            return Object.assign({}, state, {
                isFetching: true
            });

        case RECEIVE_SEARCH:
            return Object.assign({}, state, {
                isFetching: false,
                searches: [...state.searches, action.results], // Add search to search history
                searchesByServiceAndDataTypeID: {
                    ...state.searchesByServiceAndDataTypeID,
                    [action.serviceID]: {
                        ...(state.searchesByServiceAndDataTypeID[action.serviceID] || {}),
                        [action.dataTypeID]: [
                            ...((state.searchesByServiceAndDataTypeID[action.serviceID] || {})[action.dataTypeID]
                                || []),
                            action.results
                        ]
                    }
                },
                lastUpdated: action.receivedAt
            });

        case SELECT_SEARCH:
            return Object.assign({}, state, {
                selectedSearchByServiceAndDataTypeID: {
                    ...state.selectedSearchByServiceAndDataTypeID,
                    [action.serviceID]: {
                        ...(state.selectedSearchByServiceAndDataTypeID[action.serviceID] || {}),
                        [action.dataTypeID]: action.searchIndex
                    }
                }
            });

        case HANDLE_SEARCH_ERROR:
            return Object.assign({}, state, {
                isFetching: false
                // TODO: Error message
            });

        case SELECT_DISCOVERY_SERVICE_DATA_TYPE:
            return Object.assign({}, state, {
                selectedServiceID: action.serviceID,
                selectedDataTypeID: action.dataTypeID
            });

        case CLEAR_DISCOVERY_SERVICE_DATA_TYPE:
            return Object.assign({}, state, {
                selectedServiceID: null,
                selectedDataTypeID: null
            });

        case UPDATE_DISCOVERY_SEARCH_FORM:
            return Object.assign({}, state, {
                searchFormsByServiceAndDataTypeID: {
                    ...state.searchFormsByServiceAndDataTypeID,
                    [action.serviceID]: {
                        ...state.searchFormsByServiceAndDataTypeID[action.serviceID],
                        [action.dataTypeID]: JSON.parse(JSON.stringify(action.fields)) // TODO: Hack-y deep clone
                    }
                }
            });

        default:
            return state;
    }
};

const rootReducer = combineReducers({
    services,
    serviceMetadata,
    serviceDataTypes,
    discovery
});

export default rootReducer;
