import {
    FETCH_PROJECTS,

    FETCHING_PROJECT_DATASETS,
    FETCH_PROJECT_DATASETS,

    CREATE_PROJECT,
    DELETE_PROJECT,

    SELECT_PROJECT,

    PROJECT_DATASET_ADDITION,

    TOGGLE_PROJECT_CREATION_MODAL,
    TOGGLE_PROJECT_DELETION_MODAL,
    TOGGLE_PROJECT_DATASET_ADDITION_MODAL,

    PROJECT_EDITING,
    SAVE_PROJECT,

    FETCH_DROP_BOX_TREE,

    FETCH_RUNS,
    FETCH_RUN_DETAILS,

    SUBMIT_INGESTION_RUN,
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
                items: action.data.sort(projectSort),
                itemsByID: Object.fromEntries(action.data.map(p => [p.id, p])),
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
                    [action.data.id]: action.data
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
                items: state.items.filter(p => p.id !== action.projectID),
                itemsByID: {...state.itemsByID}
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
        isFetchingAll: false,
        isAdding: false,
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
            let newState = {
                ...state,
                itemsByProjectID: {...state.itemsByProjectID}  // One layer deeper with the copy to avoid mutation
            };

            if (newState.itemsByProjectID.hasOwnProperty(action.projectID)) {
                delete newState.itemsByProjectID[action.projectID];
            }

            return newState;

        case FETCHING_PROJECT_DATASETS.BEGIN:
            return {...state, isFetchingAll: true};

        case FETCHING_PROJECT_DATASETS.END:
            return {
                ...state,
                isFetching: false,
                isFetchingAll: false
            };

        case FETCH_PROJECT_DATASETS.REQUEST:
            return {...state, isFetching: true};

        case FETCH_PROJECT_DATASETS.RECEIVE:
            return {
                ...state,
                isFetching: false,
                itemsByProjectID: {
                    ...state.itemsByProjectID,
                    [action.projectID]: action.data
                }
            };

        case FETCH_PROJECT_DATASETS.ERROR:
            return {...state, isFetching: false};

        case PROJECT_DATASET_ADDITION.BEGIN:
            return {...state, isAdding: true};

        case PROJECT_DATASET_ADDITION.END:
            // TODO
            return {
                ...state,
                isAdding: false,
                itemsByProjectID: {
                    ...state.itemsByProjectID,
                    [action.projectID]: [...(state.itemsByProjectID[action.projectID] || []), action.dataset]
                }
            };

        case PROJECT_DATASET_ADDITION.TERMINATE:
            return {...state, isAdding: false};

        default:
            return state;
    }
};

export const manager = (
    state = {
        selectedProjectID: null,
        projectCreationModal: false,
        projectDeletionModal: false,
        projectDatasetCreationModal: false,
        editingProject: false
    },
    action
) => {
    switch (action.type) {
        case SELECT_PROJECT:
            return {...state, selectedProjectID: action.projectID};

        case DELETE_PROJECT.RECEIVE:
            return {
                ...state,
                selectedProjectID: state.selectedProjectID === action.projectID ? null : state.selectedProjectID
            };

        case TOGGLE_PROJECT_CREATION_MODAL:
            return {...state, projectCreationModal: !state.projectCreationModal};

        case TOGGLE_PROJECT_DELETION_MODAL:
            return {...state, projectDeletionModal: !state.projectDeletionModal};

        case TOGGLE_PROJECT_DATASET_ADDITION_MODAL:
            return {...state, projectDatasetCreationModal: !state.projectDatasetCreationModal};

        case PROJECT_EDITING.BEGIN:
            return {...state, editingProject: true};

        case PROJECT_EDITING.END:
            return {...state, editingProject: false};

        default:
            return state;
    }
};

export const dropBox = (
    state = {
        isFetching: true,
        tree: []
    },
    action
) => {
    switch (action.type) {
        case FETCH_DROP_BOX_TREE.REQUEST:
            return {...state, isFetching: true};

        case FETCH_DROP_BOX_TREE.RECEIVE:
            return {
                ...state,
                isFetching: false,
                tree: action.data
            };

        case FETCH_DROP_BOX_TREE.ERROR:
            return {...state, isFetching: false};

        default:
            return state;
    }
};

export const runs = (
    state = {
        isFetching: false,
        isSubmittingIngestionRun: false,
        items: [],
        itemDetails: {}
    },
    action
) => {
    switch (action.type) {
        case FETCH_RUNS.REQUEST:
            return {...state, isFetching: true};

        case FETCH_RUNS.RECEIVE:
            return {
                ...state,
                isFetching: false,
                items: action.data
            };

        case FETCH_RUNS.ERROR:
            return {...state, isFetching: false};

        case FETCH_RUN_DETAILS.REQUEST:
            return {
                ...state,
                itemDetails: {
                    ...state.itemDetails,
                    [action.runID]: {
                        isFetching: true,
                        details: (state.itemDetails[action.runID] || {details: null}).details
                    }
                }
            };

        case FETCH_RUN_DETAILS.RECEIVE:
            return {
                ...state,
                isFetching: false,
                items: state.items.map(i => i.run_id === action.runID ? {...i, state: action.data.state} : i),
                itemDetails: {
                    ...state.itemDetails,
                    [action.runID]: {
                        isFetching: false,
                        details: action.data
                    }
                }
            };

        case FETCH_RUN_DETAILS.ERROR:
            return {
                ...state,
                itemDetails: {
                    ...state.itemDetails,
                    [action.runID]: {
                        isFetching: false,
                        details: (state.itemDetails[action.runID] || {details: null}).details
                    }
                }
            };

        case SUBMIT_INGESTION_RUN.REQUEST:
            return {...state, isSubmittingIngestionRun: true};

        case SUBMIT_INGESTION_RUN.RECEIVE:  // TODO: Do something here
        case SUBMIT_INGESTION_RUN.ERROR:
            return {...state, isSubmittingIngestionRun: false};

        default:
            return state;
    }
};
