import {objectWithoutProp} from "../../utils";

import {
    FETCH_PROJECTS,

    FETCH_PROJECT_DATASETS,

    FETCHING_PROJECT_TABLES,
    FETCH_PROJECT_TABLES,

    CREATE_PROJECT,
    DELETE_PROJECT,
    SAVE_PROJECT,

    ADD_PROJECT_DATASET,
    PROJECT_TABLE_ADDITION,
    PROJECT_TABLE_DELETION,

    FETCH_PHENOPACKETS, FETCH_BIOSAMPLES, FETCH_INDIVIDUALS
} from "./actions";


const projectSort = (a, b) => a.name.localeCompare(b.name);


export const projects = (
    state = {
        isFetching: false,
        isCreating: false,
        isDeleting: false,
        isSaving: false,
        items: [],
        itemsByID: {}
    },
    action
) => {
    switch (action.type) {
        case FETCH_PROJECTS.REQUEST:
            return {...state, isFetching: true};

        case FETCH_PROJECTS.RECEIVE:
            return {
                ...state,
                isFetching: false,
                items: action.data.results.sort(projectSort),
                itemsByID: Object.fromEntries(action.data.results.map(p => [p.project_id, p])),
            };

        case FETCH_PROJECTS.ERROR:
            return {...state, isFetching: false};


        case CREATE_PROJECT.REQUEST:
            return {...state, isCreating: true};

        case CREATE_PROJECT.RECEIVE:
            return {
                ...state,
                isCreating: false,
                items: [...state.items, action.data].sort(projectSort),
                itemsByID: {
                    ...state.itemsByID,
                    [action.data.project_id]: action.data
                }
            };

        case CREATE_PROJECT.ERROR:
            return {...state, isCreating: false};


        case DELETE_PROJECT.REQUEST:
            return {...state, isDeleting: true};

        case DELETE_PROJECT.RECEIVE:
            let newState = {
                ...state,
                isDeleting: false,
                items: state.items.filter(p => p.project_id !== action.projectID),
                itemsByID: objectWithoutProp(state.itemsByID, action.projectID)
            };

            if (newState.itemsByID.hasOwnProperty(action.projectID)) {
                delete newState.itemsByID[action.projectID];
            }

            return newState;

        case DELETE_PROJECT.ERROR:
            return {...state, isDeleting: false};


        case SAVE_PROJECT.REQUEST:
            return {...state, isSaving: true};

        case SAVE_PROJECT.RECEIVE:
            return {
                ...state,
                isSaving: false,
                items: [...state.items.filter(p => p.id !== action.data.id), action.data].sort(projectSort),
                itemsByID: {
                    ...state.itemsByID,
                    [action.data.id]: action.data
                }
            };

        case SAVE_PROJECT.ERROR:
            return {...state, isSaving: false};


        default:
            return state;
    }
};


export const projectDatasets = (
    state = {
        isFetching: false,
        isAdding: false,
        items: [],
        itemsByProjectID: {}
    },
    action
) => {
    switch (action.type) {
        case CREATE_PROJECT.RECEIVE:
            // TODO: Might want to re-fetch upon project creation instead...
            return {
                ...state,
                itemsByProjectID: {
                    ...state.itemsByProjectID,
                    [action.data.id]: []
                }
            };

        case DELETE_PROJECT.RECEIVE:
            return {
                ...state,
                itemsByProjectID: objectWithoutProp(state.itemsByProjectID, action.projectID)
            };

        case FETCH_PROJECT_DATASETS.REQUEST:
            return {
                ...state,
                isFetching: true
            };

        case FETCH_PROJECT_DATASETS.RECEIVE:
            return {
                ...state,
                isFetching: false,
                items: action.data.results,
                itemsByProjectID: Object.fromEntries(action.data.results.map(ds =>
                    [ds.project, action.data.results.filter(ds2 => ds2.project === ds.project)]))
            };

        case FETCH_PROJECT_DATASETS.ERROR:
            return {
                ...state,
                isFetching: false
            };

        case ADD_PROJECT_DATASET.REQUEST:
            return {...state, isAdding: true};

        case ADD_PROJECT_DATASET.RECEIVE:
            return {
                ...state,
                isAdding: false,
                items: [...state.items, action.data],
                itemsByProjectID: {
                    ...state.itemsByProjectID,
                    [action.data.project]: [
                        ...(state.itemsByProjectID[action.data.project] || []),
                        action.data
                    ]
                }
            };

        case ADD_PROJECT_DATASET.ERROR:
            return {...state, isAdding: false};

        default:
            return state;
    }
};


export const projectTables = (
    state = {
        isFetching: false,
        isFetchingAll: false,
        isAdding: false,
        isDeleting: false,
        items: [],
        itemsByProjectID: {}
    },
    action
) => {
    switch (action.type) {
        case CREATE_PROJECT.RECEIVE:
            // TODO: Might want to re-fetch upon project creation instead...
            return {
                ...state,
                itemsByProjectID: {
                    ...state.itemsByProjectID,
                    [action.data.id]: []
                }
            };

        case DELETE_PROJECT.RECEIVE:
            return {
                ...state,
                items: state.items.filter(t => t.project_id !== action.projectID),
                itemsByProjectID: objectWithoutProp(state.itemsByProjectID, action.projectID)
            };

        case FETCHING_PROJECT_TABLES.BEGIN:
            return {...state, isFetchingAll: true};

        case FETCHING_PROJECT_TABLES.END:
            return {
                ...state,
                isFetching: false,
                isFetchingAll: false
            };

        case FETCH_PROJECT_TABLES.REQUEST:
            return {...state, isFetching: true};

        case FETCH_PROJECT_TABLES.RECEIVE:
            return {
                ...state,
                isFetching: false,
                items: [
                    ...state.items,
                    ...action.data.results
                        .map(t => ({
                            ...t,
                            project_id: (Object.entries(action.projectDatasets)
                                .filter(([_, datasets]) => datasets.map(d => d.dataset_id)
                                    .includes(t.dataset))[0] || [])[0] || null
                        }))
                        .filter(t => t.project_id !== null && !state.items.map(t => t.table_id).includes(t.table_id))
                ],
                itemsByProjectID: {  // TODO: Improve performance by maybe returning project ID on server side?
                    ...state.itemsByProjectID,
                    ...Object.fromEntries(Object.entries(action.projectDatasets).map(([projectID, datasets]) =>
                        [projectID, action.data.results.filter(t => datasets
                            .map(d => d.dataset_id)
                            .includes(t.dataset))]))
                }
            };

        case FETCH_PROJECT_TABLES.ERROR:
            return {...state, isFetching: false};

        case PROJECT_TABLE_ADDITION.BEGIN:
            return {...state, isAdding: true};

        case PROJECT_TABLE_ADDITION.END:
            // TODO
            return {
                ...state,
                isAdding: false,
                items: [...state.items, action.table],
                itemsByProjectID: {
                    ...state.itemsByProjectID,
                    [action.projectID]: [...(state.itemsByProjectID[action.projectID] || []), action.table]
                }
            };

        case PROJECT_TABLE_ADDITION.TERMINATE:
            return {...state, isAdding: false};

        case PROJECT_TABLE_DELETION.BEGIN:
            return {...state, isDeleting: true};

        case PROJECT_TABLE_DELETION.END:
            return {
                ...state,
                isDeleting: false,
                items: state.items.filter(t => t.table_id !== action.tableID),
                itemsByProjectID: {
                    ...state.itemsByProjectID,
                    [action.projectID]: (state.itemsByProjectID[action.projectID] || [])
                        .filter(t => t.id !== action.tableID)
                }
            };

        case PROJECT_TABLE_DELETION.TERMINATE:
            return {...state, isDeleting: false};

        default:
            return state;
    }
};


export const phenopackets = (
    state = {
        isFetching: false,
        items: [],
        itemsByDatasetID: {}
    },
    action
) => {
    switch (action.type) {
        case FETCH_PHENOPACKETS.REQUEST:
            return {...state, isFetching: true};

        case FETCH_PHENOPACKETS.RECEIVE:
            return {
                ...state,
                isFetching: false,
                items: [...action.data.results],
                itemsByDatasetID: Object.fromEntries(Object.entries(action))
            };

        case FETCH_PHENOPACKETS.ERROR:
            return {...state, isFetching: false};

        default:
            return state;
    }
};

export const biosamples = (
    state = {
        isFetching: false,
        items: [],
        itemsByID: {}
    },
    action
) => {
    switch (action.type) {
        case FETCH_BIOSAMPLES.REQUEST:
            return {...state, isFetching: true};

        case FETCH_BIOSAMPLES.RECEIVE:
            return {
                ...state,
                isFetching: false,
                items: [...action.data.results],
                itemsByID: Object.fromEntries(action.data.results.map(b => [b.biosample_id, b]))
            };

        case FETCH_BIOSAMPLES.ERROR:
            return {...state, isFetching: false};

        default:
            return state;
    }
};

export const individuals = (
    state = {
        isFetching: false,
        items: [],
        itemsByID: {}
    },
    action
) => {
    switch (action.type) {
        case FETCH_INDIVIDUALS.REQUEST:
            return {...state, isFetching: true};

        case FETCH_INDIVIDUALS.RECEIVE:
            return {
                ...state,
                isFetching: false,
                items: [...action.data.results],
                itemsByID: Object.fromEntries(action.data.results.map(i => [i.individual_id, i]))
            };

        case FETCH_INDIVIDUALS.ERROR:
            return {...state, isFetching: false};

        default:
            return state;
    }
};
