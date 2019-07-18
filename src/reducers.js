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

    SELECT_DISCOVERY_SERVICE_DATASET, CLEAR_DISCOVERY_SERVICE_DATASET
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

const searches = (
    state = {
        isFetching: false,
        items: [],
        itemsByServiceAndDatasetID: {},
        selectedSearchByServiceAndDatasetID: {}
    },
    action
) => {
    switch (action.type) {
        case REQUEST_SEARCH:
            return Object.assign({}, state, {
                isFetching: true
            });

        case RECEIVE_SEARCH:
            return Object.assign({}, state, {
                isFetching: false,
                items: [...state.items, action.results], // Add search to search history
                itemsByServiceAndDatasetID: {
                    ...state.itemsByServiceAndDatasetID,
                    [action.serviceID]: {
                        ...(state.itemsByServiceAndDatasetID[action.serviceID] || {}),
                        [action.datasetID]: [
                            ...((state.itemsByServiceAndDatasetID[action.serviceID] || {})[action.datasetID] || []),
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
        default:
            return state;
    }
};

const discovery = (
    state = {
        isFetching: false,
        selectedServiceID: null,
        selectedDatasetID: null,
        searchKeys: [],
        searchConditions: [],
        searches: [],
        searchesByServiceAndDatasetID: {},
        selectedSearchByServiceAndDatasetID: {}
    },
    action
) => {
    switch (action.type) {
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

        default:
            return state;
    }
};

const rootReducer = combineReducers({
    services,
    serviceMetadata,
    serviceDatasets,
    searches,
    discovery
});

export default rootReducer;
