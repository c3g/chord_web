import {combineReducers} from "redux";
import {
    REQUEST_SERVICES,
    RECEIVE_SERVICES,

    REQUEST_SERVICE_METADATA,
    RECEIVE_SERVICE_METADATA,

    REQUEST_SERVICE_DATASETS,
    RECEIVE_SERVICE_DATASETS,

    REQUEST_SEARCH,
    RECEIVE_SEARCH,
    SELECT_SEARCH,

    SELECT_DISCOVERY_SERVICE_DATASET, CLEAR_DISCOVERY_SERVICE_DATASET, UPDATE_DISCOVERY_SEARCH_FORM
} from "./actions";

const services = (
    state={
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
    state={
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

const serviceDatasets = (
    state = {
        isFetching: false,
        datasets: {},
        datasetsByServiceAndDatasetID: {}
    },
    action
) => {
    switch (action.type) {
        case REQUEST_SERVICE_DATASETS:
            return Object.assign({}, state, {
                isFetching: true,
            });

        case RECEIVE_SERVICE_DATASETS:
            return Object.assign({}, state, {
                isFetching: false,
                datasets: {
                    ...state.datasets,
                    [action.service]: action.datasets
                },
                datasetsByServiceAndDatasetID: {
                    ...state.datasetsByServiceAndDatasetID,
                    [action.service]: Object.assign({}, ...action.datasets.map(d => ({[d.id]: d})))
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
        selectedServiceID: null,
        selectedDatasetID: null,
        searchFormsByServiceAndDatasetID: {},
        searches: [],
        searchesByServiceAndDatasetID: {},
        selectedSearchByServiceAndDatasetID: {}
    },
    action
) => {
    switch (action.type) {
        case RECEIVE_SERVICE_DATASETS:
            return Object.assign({}, state, {
                searchFormsByServiceAndDatasetID: {
                    ...state.searchFormsByServiceAndDatasetID,
                    [action.service]: {
                        ...Object.assign({}, ...action.datasets.map(d => ({
                            [d.id]: (state.searchFormsByServiceAndDatasetID[action.service] || {})[d.id] || {}
                        })))
                    }
                }
            });

        case REQUEST_SEARCH:
            return Object.assign({}, state, {
                isFetching: true
            });

        case RECEIVE_SEARCH:
            return Object.assign({}, state, {
                isFetching: false,
                searches: [...state.searches, action.results], // Add search to search history
                searchesByServiceAndDatasetID: {
                    ...state.searchesByServiceAndDatasetID,
                    [action.serviceID]: {
                        ...(state.searchesByServiceAndDatasetID[action.serviceID] || {}),
                        [action.datasetID]: [
                            ...((state.searchesByServiceAndDatasetID[action.serviceID] || {})[action.datasetID] || []),
                            action.results
                        ]
                    }
                },
                lastUpdated: action.receivedAt
            });

        case SELECT_SEARCH:
            return Object.assign({}, state, {
                selectedSearchByServiceAndDatasetID: {
                    ...state.selectedSearchByServiceAndDatasetID,
                    [action.serviceID]: {
                        ...(state.selectedSearchByServiceAndDatasetID[action.serviceID] || {}),
                        [action.datasetID]: action.searchIndex
                    }
                }
            });

        case SELECT_DISCOVERY_SERVICE_DATASET:
            return Object.assign({}, state, {
                selectedServiceID: action.serviceID,
                selectedDatasetID: action.datasetID
            });

        case CLEAR_DISCOVERY_SERVICE_DATASET:
            return Object.assign({}, state, {
                selectedServiceID: null,
                selectedDatasetID: null
            });

        case UPDATE_DISCOVERY_SEARCH_FORM:
            return Object.assign({}, state, {
                searchFormsByServiceAndDatasetID: {
                    ...state.searchFormsByServiceAndDatasetID,
                    [action.serviceID]: {
                        ...state.searchFormsByServiceAndDatasetID[action.serviceID],
                        [action.datasetID]: JSON.parse(JSON.stringify(action.fields)) // TODO: Hack-y deep clone
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
    serviceDatasets,
    discovery
});

export default rootReducer;
