import {
    BEGIN_LOADING_ALL_SERVICE_DATA,
    END_LOADING_ALL_SERVICE_DATA,

    REQUEST_SERVICES,
    RECEIVE_SERVICES,

    REQUEST_SERVICE_METADATA,
    RECEIVE_SERVICE_METADATA,

    REQUEST_SERVICE_DATA_TYPES,
    RECEIVE_SERVICE_DATA_TYPES,

    REQUEST_SERVICE_DATASETS,
    RECEIVE_SERVICE_DATASETS,

    BEGIN_ADDING_SERVICE_DATASET,
    END_ADDING_SERVICE_DATASET,
    TERMINATE_ADDING_SERVICE_DATASET,

    BEGIN_FETCHING_SERVICE_WORKFLOWS,
    END_FETCHING_SERVICE_WORKFLOWS,
    REQUEST_SERVICE_WORKFLOWS,
    RECEIVE_SERVICE_WORKFLOWS,
} from "./actions";

export const services = (
    state = {
        isFetching: false,
        isFetchingAll: false,
        items: [],
        itemsByID: {}
    },
    action
) => {
    switch (action.type) {
        case BEGIN_LOADING_ALL_SERVICE_DATA:
            return Object.assign({}, state, {isFetchingAll: true});

        case END_LOADING_ALL_SERVICE_DATA:
            return Object.assign({}, state, {isFetchingAll: false});

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

export const serviceMetadata = (
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

export const serviceDataTypes = (
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
                    [action.serviceID]: action.dataTypes
                },
                dataTypesByServiceAndDataTypeID: {
                    ...state.dataTypesByServiceAndDataTypeID,
                    [action.serviceID]: Object.assign({}, ...action.dataTypes.map(d => ({[d.id]: d})))
                },
                lastUpdated: action.receivedAt
            });

        default:
            return state;
    }
};

export const serviceDatasets = (
    state = {
        isFetching: false,
        isCreating: false,
        datasetsByServiceAndDataTypeID: {}
    },
    action
) => {
    switch (action.type) {
        case REQUEST_SERVICE_DATASETS:
            return Object.assign({}, state, {
                isFetching: true
            });

        case RECEIVE_SERVICE_DATASETS:
            return Object.assign({}, state, {
                isFetching: false,
                datasetsByServiceAndDataTypeID: {
                    ...state.datasetsByServiceAndDataTypeID,
                    [action.serviceID]: {
                        ...(state.datasetsByServiceAndDataTypeID[action.serviceID] || {}),
                        [action.dataTypeID]: action.datasets
                    }
                }
            });

        case BEGIN_ADDING_SERVICE_DATASET:
            return Object.assign({}, state, {
                isCreating: true
            });

        case END_ADDING_SERVICE_DATASET:
            return Object.assign({}, state, {
                isCreating: false,
                datasetsByServiceAndDataTypeID: {
                    ...state.datasetsByServiceAndDataTypeID,
                    [action.serviceID]: {
                        ...(state.datasetsByServiceAndDataTypeID[action.serviceID] || {}),
                        [action.dataTypeID]: [
                            ...(state.datasetsByServiceAndDataTypeID[action.serviceID][action.dataTypeID] || []),
                            action.dataset
                        ]
                    }
                }
            });

        case TERMINATE_ADDING_SERVICE_DATASET:
            return Object.assign({}, state, {
                isCreating: false
            });

        default:
            return state;
    }
};

export const serviceWorkflows = (
    state = {
        isFetchingAll: false,
        workflowsByServiceID: {}
    },
    action
) => {
    switch (action.type) {
        case BEGIN_FETCHING_SERVICE_WORKFLOWS:
            return Object.assign({}, state, {
                isFetchingAll: true
            });

        case END_FETCHING_SERVICE_WORKFLOWS:
            return Object.assign({}, state, {
                isFetchingAll: false
            });

        case REQUEST_SERVICE_WORKFLOWS:
            return Object.assign({}, state, {
                workflowsByServiceID: {
                    ...state.workflowsByServiceID,
                    [action.serviceID]: {
                        isFetching: true,
                        ...(state.workflowsByServiceID[action.serviceID] || {})
                    }
                }
            });

        case RECEIVE_SERVICE_WORKFLOWS:
            return Object.assign({}, state, {
                isFetching: false,
                workflowsByServiceID: {
                    ...state.workflowsByServiceID,
                    [action.serviceID]: {
                        isFetching: false,
                        workflows: action.workflows
                    }
                }
            });

        default:
            return state;
    }
};
