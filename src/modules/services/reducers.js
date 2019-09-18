import {
    LOADING_ALL_SERVICE_DATA,

    FETCH_SERVICES,
    FETCH_SERVICE_METADATA,
    FETCH_SERVICE_DATA_TYPES,
    FETCH_SERVICE_DATASETS,

    ADDING_SERVICE_DATASET,

    FETCHING_SERVICE_WORKFLOWS,
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
        case LOADING_ALL_SERVICE_DATA.BEGIN:
            return {...state, isFetchingAll: true};

        case LOADING_ALL_SERVICE_DATA.END:
        case LOADING_ALL_SERVICE_DATA.TERMINATE:
            return {...state, isFetchingAll: false};

        case FETCH_SERVICES.REQUEST:
            return {...state, isFetching: true};

        case FETCH_SERVICES.RECEIVE:
            return {
                ...state,
                isFetching: false,
                items: action.data,
                itemsByID: Object.fromEntries(action.data.map(s => [s.id, s])),
                lastUpdated: action.receivedAt
            };

        case FETCH_SERVICES.ERROR:
            return {...state, isFetching: false};

        default:
            return state;
    }
};

export const serviceMetadata = (
    state = {
        isFetching: false,  // TODO: Network epic
        didInvalidate: false,
        metadata: {}
    },
    action
) => {
    switch (action.type) {
        case FETCH_SERVICE_METADATA.REQUEST:
            return {
                ...state,
                isFetching: true,
                metadata: {
                    ...state.metadata,
                    [action.serviceID]: {
                        ...(state.metadata[action.serviceID] || {metadata: null}),
                        isFetching: true
                    }
                }
            };

        case FETCH_SERVICE_METADATA.RECEIVE:
            return {
                ...state,
                isFetching: false,
                metadata: {
                    ...state.metadata,
                    [action.serviceID]: {
                        metadata: action.data,
                        isFetching: false
                    }
                },
                lastUpdated: action.receivedAt
            };

        case FETCH_SERVICE_METADATA.ERROR:
            return {
                ...state,
                isFetching: true,
                metadata: {
                    ...state.metadata,
                    [action.serviceID]: {
                        ...(state.metadata[action.serviceID] || {metadata: null}),
                        isFetching: false
                    }
                }
            };

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
            return {
                ...state,
                dataTypesByServiceID: {
                    ...state.dataTypesByServiceID,
                    [action.serviceID]: {
                        ...(state.dataTypesByServiceID[action.serviceID] || {items: null, itemsByID: null}),
                        isFetching: true
                    }
                }
            };

        case FETCH_SERVICE_DATA_TYPES.RECEIVE:
            return {
                ...state,
                dataTypesByServiceID: {
                    ...state.dataTypesByServiceID,
                    [action.serviceID]: {
                        items: action.data,
                        itemsByID: Object.fromEntries(action.data.map(d => [d.id, d])),
                        isFetching: false
                    }
                },
                lastUpdated: action.receivedAt
            };

        case FETCH_SERVICE_DATA_TYPES.ERROR:
            return {
                ...state,
                dataTypesByServiceID: {
                    ...state.dataTypesByServiceID,
                    [action.serviceID]: {
                        ...(state.dataTypesByServiceID[action.serviceID] || {items: null, itemsByID: null}),
                        isFetching: false
                    }
                }
            };

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
            return {
                ...state,
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
            };

        case FETCH_SERVICE_DATASETS.RECEIVE:
            return {
                ...state,
                datasetsByServiceAndDataTypeID: {
                    ...state.datasetsByServiceAndDataTypeID,
                    [action.serviceID]: {
                        ...(state.datasetsByServiceAndDataTypeID[action.serviceID] || {}),
                        [action.dataTypeID]: {
                            datasets: action.data,
                            isFetching: false
                        }
                    }
                }
            };

        case FETCH_SERVICE_DATASETS.ERROR:
            return {
                ...state,
                datasetsByServiceAndDataTypeID: {
                    ...state.datasetsByServiceAndDataTypeID,
                    [action.serviceID]: {
                        ...(state.datasetsByServiceAndDataTypeID[action.serviceID] || {}),
                        [action.dataTypeID]: {
                            ...((state.datasetsByServiceAndDataTypeID[action.serviceID] || {})[action.dataTypeID]
                                || {datasets: null}),
                            isFetching: false
                        }
                    }
                }
            };

        case ADDING_SERVICE_DATASET.BEGIN:
            return {...state, isCreating: true};

        case ADDING_SERVICE_DATASET.END:
            return {
                ...state,
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
            };

        case ADDING_SERVICE_DATASET.TERMINATE:
            return {...state, isCreating: false};

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
        case FETCHING_SERVICE_WORKFLOWS.BEGIN:
            return {...state, isFetchingAll: true};

        case FETCHING_SERVICE_WORKFLOWS.END:
        case FETCHING_SERVICE_WORKFLOWS.TERMINATE:
            return {...state, isFetchingAll: false};

        case FETCH_SERVICE_WORKFLOWS.REQUEST:
            return {
                ...state,
                workflowsByServiceID: {
                    ...state.workflowsByServiceID,
                    [action.serviceID]: {
                        isFetching: true,
                        ...(state.workflowsByServiceID[action.serviceID] || {workflows: null})
                    }
                }
            };

        case FETCH_SERVICE_WORKFLOWS.RECEIVE:
            return {
                ...state,
                isFetching: false,
                workflowsByServiceID: {
                    ...state.workflowsByServiceID,
                    [action.serviceID]: {
                        isFetching: false,
                        workflows: action.data
                    }
                }
            };

        case FETCH_SERVICE_WORKFLOWS.ERROR:
            return {...state, isFetching: false};

        default:
            return state;
    }
};
