import {
    BEGIN_LOADING_ALL_SERVICE_DATA,
    END_LOADING_ALL_SERVICE_DATA,

    FETCH_SERVICES,

    REQUEST_SERVICE_METADATA,
    RECEIVE_SERVICE_METADATA,

    FETCH_SERVICE_DATA_TYPES,
    FETCH_SERVICE_DATASETS,

    BEGIN_ADDING_SERVICE_DATASET,
    END_ADDING_SERVICE_DATASET,
    TERMINATE_ADDING_SERVICE_DATASET,

    BEGIN_FETCHING_SERVICE_WORKFLOWS,
    END_FETCHING_SERVICE_WORKFLOWS,
    FETCH_SERVICE_WORKFLOWS
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

        case FETCH_SERVICES.REQUEST:
            return Object.assign({}, state, {
                isFetching: true,
            });

        case FETCH_SERVICES.RECEIVE:
            return Object.assign({}, state, {
                isFetching: false,
                items: action.services,
                itemsByID: Object.assign({}, state.itemsByID, ...action.services.map(s => ({[s.id]: s}))),
                lastUpdated: action.receivedAt
            });

        case FETCH_SERVICES.ERROR:
            return Object.assign({}, state, {
                isFetching: false
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
                metadata: action.metadata,
                lastUpdated: action.receivedAt
            });

        default:
            return state;
    }
};

export const serviceDataTypes = (
    state = {
        isFetching: false,  // TODO: Network epic
        dataTypesByServiceID: {}
    },
    action
) => {
    switch (action.type) {
        case FETCH_SERVICE_DATA_TYPES.REQUEST:
            return Object.assign({}, state, {
                dataTypesByServiceID: {
                    ...state.dataTypesByServiceID,
                    [action.serviceID]: {
                        ...(state.dataTypesByServiceID[action.serviceID] || {items: null, itemsByID: null}),
                        isFetching: true
                    }
                }
            });

        case FETCH_SERVICE_DATA_TYPES.RECEIVE:
            return Object.assign({}, state, {
                dataTypesByServiceID: {
                    ...state.dataTypesByServiceID,
                    [action.serviceID]: {
                        items: action.dataTypes,
                        itemsByID: Object.fromEntries(action.dataTypes.map(d => [d.id, d])),
                        isFetching: false
                    }
                },
                lastUpdated: action.receivedAt
            });

        case FETCH_SERVICE_DATA_TYPES.ERROR:
            return Object.assign({}, state, {
                dataTypesByServiceID: {
                    ...state.dataTypesByServiceID,
                    [action.serviceID]: {
                        ...(state.dataTypesByServiceID[action.serviceID] || {items: null, itemsByID: null}),
                        isFetching: false
                    }
                }
            });

        default:
            return state;
    }
};

export const serviceDatasets = (
    state = {
        isFetching: false,  // TODO: Begin/end
        isCreating: false,
        datasetsByServiceAndDataTypeID: {}
    },
    action
) => {
    switch (action.type) {
        case FETCH_SERVICE_DATASETS.REQUEST:
            return Object.assign({}, state, {
                datasetsByServiceAndDataTypeID: {
                    ...state.datasetsByServiceAndDataTypeID,
                    [action.serviceID]: {
                        ...(state.datasetsByServiceAndDataTypeID[action.serviceID] || {}),
                        [action.dataTypeID]: {
                            ...((state.datasetsByServiceAndDataTypeID[action.serviceID] || {})[action.dataTypeID]
                                || {datasets: null}),
                            isFetching: true
                        }
                    }
                }
            });

        case FETCH_SERVICE_DATASETS.RECEIVE:
            return Object.assign({}, state, {
                datasetsByServiceAndDataTypeID: {
                    ...state.datasetsByServiceAndDataTypeID,
                    [action.serviceID]: {
                        ...(state.datasetsByServiceAndDataTypeID[action.serviceID] || {}),
                        [action.dataTypeID]: {
                            datasets: action.datasets,
                            isFetching: false
                        }
                    }
                }
            });

        case FETCH_SERVICE_DATASETS.ERROR:
            return Object.assign({}, state, {
                ...state.datasetsByServiceAndDataTypeID,
                [action.serviceID]: {
                    ...(state.datasetsByServiceAndDataTypeID[action.serviceID] || {}),
                    [action.dataTypeID]: {
                        ...((state.datasetsByServiceAndDataTypeID[action.serviceID] || {})[action.dataTypeID]
                            || {datasets: null}),
                        isFetching: false
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

        case FETCH_SERVICE_WORKFLOWS.REQUEST:
            return Object.assign({}, state, {
                workflowsByServiceID: {
                    ...state.workflowsByServiceID,
                    [action.serviceID]: {
                        isFetching: true,
                        ...(state.workflowsByServiceID[action.serviceID] || {workflows: null})
                    }
                }
            });

        case FETCH_SERVICE_WORKFLOWS.RECEIVE:
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

        case FETCH_SERVICE_WORKFLOWS.ERROR:
            return Object.assign({}, state, {
                isFetching: false
            });

        default:
            return state;
    }
};
