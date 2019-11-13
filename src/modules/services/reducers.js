import {objectWithoutProp} from "../../utils";

import {
    LOADING_ALL_SERVICE_DATA,

    FETCH_CHORD_SERVICES,
    FETCH_SERVICES,

    FETCH_SERVICE_DATA_TYPES,
    LOADING_SERVICE_DATA_TYPES,

    FETCH_SERVICE_TABLES,
    LOADING_SERVICE_TABLES,

    ADDING_SERVICE_TABLE,
    DELETING_SERVICE_TABLE,

    FETCH_SERVICE_WORKFLOWS,
    LOADING_SERVICE_WORKFLOWS
} from "./actions";

export const chordServices = (
    state = {
        isFetching: false,
        items: []
    },
    action
) => {
    switch (action.type) {
        case FETCH_CHORD_SERVICES.REQUEST:
            return {...state, isFetching: true};

        case FETCH_CHORD_SERVICES.RECEIVE:
            return {...state, isFetching: false, items: action.data};

        case FETCH_CHORD_SERVICES.ERROR:
            return {...state, isFetching: false};

        default:
            return state;
    }
};

export const services = (
    state = {
        isFetching: false,
        isFetchingAll: false,  // TODO: Rename this, since it means more "all data including other stuff"
        items: [],
        itemsByID: {},
        itemsByArtifact: {}
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
                itemsByArtifact: Object.fromEntries(action.data.map(s => [s.type.split(":")[1], s])),
                lastUpdated: action.receivedAt
            };

        case FETCH_SERVICES.ERROR:
            return {...state, isFetching: false};

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
        isDeleting: false,
        items: [],
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
                                || {tables: [], tablesByID: {}}),
                            isFetching: true
                        }
                    }
                }
            };

        case FETCH_SERVICE_TABLES.RECEIVE:
            return {
                ...state,
                items: [...state.items, ...action.data.map(t => ({
                    ...t,
                    service_id: action.serviceID,
                    data_type: action.dataTypeID
                }))],
                itemsByServiceAndDataTypeID: {
                    ...state.itemsByServiceAndDataTypeID,
                    [action.serviceID]: {
                        ...(state.itemsByServiceAndDataTypeID[action.serviceID] || {}),
                        [action.dataTypeID]: {
                            tables: action.data,
                            tablesByID: Object.fromEntries(action.data.map(t => [t.id, {
                                ...t,
                                service_id: action.serviceID,
                                data_type: action.dataTypeID
                            }])),
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
                                || {tables: [], tablesByID: {}}),
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
                                || {tables: [], tablesByID: {}}),
                            tables: [...((state.itemsByServiceAndDataTypeID[action.serviceID] || {})[action.dataTypeID]
                                || {tables: [], tablesByID: {}}).tables, action.table],
                            tablesByID: {
                                ...((state.itemsByServiceAndDataTypeID[action.serviceID] || {})[action.dataTypeID]
                                    || {tables: [], tablesByID: {}}).tablesByID,
                                [action.table.id]: action.table
                            }
                        }
                    }
                }
            };

        case ADDING_SERVICE_TABLE.TERMINATE:
            return {...state, isCreating: false};

        case DELETING_SERVICE_TABLE.BEGIN:
            return {...state, isDeleting: true};

        case DELETING_SERVICE_TABLE.END:
            return {
                ...state,
                itemsByServiceAndDataTypeID: {
                    ...state.itemsByServiceAndDataTypeID,
                    [action.serviceID]: {
                        ...(state.itemsByServiceAndDataTypeID[action.serviceID] || {}),
                        [action.dataTypeID]: {
                            ...((state.itemsByServiceAndDataTypeID[action.serviceID] || {})[action.dataTypeID]
                                || {tables: [], tablesByID: {}}),
                            tables: (((state.itemsByServiceAndDataTypeID[action.serviceID] || {})[action.dataTypeID]
                                || {tables: [], tablesByID: {}}).tables || []).filter(t => t.id !== action.tableID),
                            tablesByID: objectWithoutProp(
                                ((state.itemsByServiceAndDataTypeID[action.serviceID] || {})[action.dataTypeID]
                                    || {tables: [], tablesByID: {}}).tablesByID,
                                action.tableID
                            )
                        }
                    }
                }
            };

        case DELETING_SERVICE_TABLE.TERMINATE:
            return {...state, isDeleting: false};

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
