import {
    LOADING_ALL_SERVICE_DATA,

    FETCH_SERVICES,

    FETCH_SERVICE_METADATA,
    LOADING_SERVICE_METADATA,

    FETCH_SERVICE_DATA_TYPES,
    LOADING_SERVICE_DATA_TYPES,

    FETCH_SERVICE_TABLES,
    LOADING_SERVICE_TABLES,

    ADDING_SERVICE_TABLE,

    FETCH_SERVICE_WORKFLOWS,
    LOADING_SERVICE_WORKFLOWS
} from "./actions";

export const services = (
    state = {
        isFetching: false,
        isFetchingAll: false,  // TODO: Rename this, since it means more "all data including other stuff"
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
        isFetchingAll: false,
        didInvalidate: false,
        metadata: {}
    },
    action
) => {
    switch (action.type) {
        case LOADING_SERVICE_METADATA.BEGIN:
            return {...state, isFetchingAll: true};

        case LOADING_SERVICE_METADATA.END:
        case LOADING_SERVICE_METADATA.TERMINATE:
            return {...state, isFetchingAll: false};

        case FETCH_SERVICE_METADATA.REQUEST:
            return {
                ...state,
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
        isFetchingAll: false,
        dataTypesByServiceID: {}
    },
    action
) => {
    switch (action.type) {
        case LOADING_SERVICE_DATA_TYPES.BEGIN:
            return {...state, isFetchingAll: true};

        case LOADING_SERVICE_DATA_TYPES.END:
        case LOADING_SERVICE_DATA_TYPES.TERMINATE:
            return {...state, isFetchingAll: false};

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

export const serviceTables = (
    state = {
        isFetchingAll: false,
        isCreating: false,
        itemsByServiceAndDataTypeID: {}
    },
    action
) => {
    switch (action.type) {
        case LOADING_SERVICE_TABLES.BEGIN:
            return {...state, isFetchingAll: true};

        case LOADING_SERVICE_TABLES.END:
        case LOADING_SERVICE_TABLES.TERMINATE:
            return {...state, isFetchingAll: false};

        case FETCH_SERVICE_TABLES.REQUEST:
            return {
                ...state,
                itemsByServiceAndDataTypeID: {
                    ...state.itemsByServiceAndDataTypeID,
                    [action.serviceID]: {
                        ...(state.itemsByServiceAndDataTypeID[action.serviceID] || {}),
                        [action.dataTypeID]: {
                            ...((state.itemsByServiceAndDataTypeID[action.serviceID] || {})[action.dataTypeID]
                                || {tables: null, tablesByID: null}),
                            isFetching: true
                        }
                    }
                }
            };

        case FETCH_SERVICE_TABLES.RECEIVE:
            return {
                ...state,
                itemsByServiceAndDataTypeID: {
                    ...state.itemsByServiceAndDataTypeID,
                    [action.serviceID]: {
                        ...(state.itemsByServiceAndDataTypeID[action.serviceID] || {}),
                        [action.dataTypeID]: {
                            tables: action.data,
                            tablesByID: Object.fromEntries(action.data.map(t => [t.id, t])),
                            isFetching: false
                        }
                    }
                }
            };

        case FETCH_SERVICE_TABLES.ERROR:
            return {
                ...state,
                itemsByServiceAndDataTypeID: {
                    ...state.itemsByServiceAndDataTypeID,
                    [action.serviceID]: {
                        ...(state.itemsByServiceAndDataTypeID[action.serviceID] || {}),
                        [action.dataTypeID]: {
                            ...((state.itemsByServiceAndDataTypeID[action.serviceID] || {})[action.dataTypeID]
                                || {tables: null, tablesByID: null}),
                            isFetching: false
                        }
                    }
                }
            };

        case ADDING_SERVICE_TABLE.BEGIN:
            return {...state, isCreating: true};

        case ADDING_SERVICE_TABLE.END:
            return {
                ...state,
                isCreating: false,
                itemsByServiceAndDataTypeID: {
                    ...state.itemsByServiceAndDataTypeID,
                    [action.serviceID]: {
                        ...(state.itemsByServiceAndDataTypeID[action.serviceID] || {}),
                        [action.dataTypeID]: {
                            ...((state.itemsByServiceAndDataTypeID[action.serviceID] || {})[action.dataTypeID]
                                || {tables: null, tablesByID: null}),
                            tables: [...((state.itemsByServiceAndDataTypeID[action.serviceID] || {})[action.dataTypeID]
                                || {tables: null, tablesByID: null}).tables, action.table],
                            tablesByID: {
                                ...((state.itemsByServiceAndDataTypeID[action.serviceID] || {})[action.dataTypeID]
                                    || {tables: null, tablesByID: null}).tablesByID,
                                [action.table.id]: action.table
                            }
                        }
                    }
                }
            };

        case ADDING_SERVICE_TABLE.TERMINATE:
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
        case LOADING_SERVICE_WORKFLOWS.BEGIN:
            return {...state, isFetchingAll: true};

        case LOADING_SERVICE_WORKFLOWS.END:
        case LOADING_SERVICE_WORKFLOWS.TERMINATE:
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
