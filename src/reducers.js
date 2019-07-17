import {combineReducers} from "redux";
import {
    REQUEST_SERVICES,
    RECEIVE_SERVICES,
    REQUEST_SERVICE_METADATA,
    RECEIVE_SERVICE_METADATA,
    REQUEST_SERVICE_DATASETS,
    RECEIVE_SERVICE_DATASETS,
    REQUEST_SEARCH,
    RECEIVE_SEARCH
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
                selectedSearchByServiceAndDatasetID: {
                    ...state.selectedSearchByServiceAndDatasetID,
                    [action.serviceID]: {
                        ...(state.selectedSearchByServiceAndDatasetID[action.serviceID] || {}),
                        [action.datasetID]: ((state.selectedSearchByServiceAndDatasetID[action.serviceID]
                            || {})[action.datasetID] || []).length
                    }
                },
                lastUpdated: action.receivedAt
            });
        default:
            return state;
    }
};

const rootReducer = combineReducers({
    services,
    serviceMetadata,
    serviceDatasets,
    searches
});

export default rootReducer;
