import {
    FETCH_PROJECTS,

    FETCHING_PROJECT_DATASETS,
    FETCH_PROJECT_DATASETS,

    PROJECT_CREATION,
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

    INGESTION_RUN_SUBMISSION,
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
            return Object.assign({}, state, {
                isFetching: true
            });

        case FETCH_PROJECTS.RECEIVE:
            // noinspection JSCheckFunctionSignatures
            return Object.assign({}, state, {
                isFetching: false,
                items: action.data.sort(projectSort),
                itemsByID: Object.fromEntries(action.data.map(p => [p.id, p])),
            });

        case FETCH_PROJECTS.ERROR:
            return Object.assign({}, state, {
                isFetching: false
            });


        case PROJECT_CREATION.BEGIN:
            return Object.assign({}, state, {
                isCreating: true
            });

        case PROJECT_CREATION.END:
            // noinspection JSCheckFunctionSignatures
            return Object.assign({}, state, {
                isCreating: false,
                items: [...state.items, action.data].sort(projectSort),
                itemsByID: {
                    ...state.itemsByID,
                    [action.data.id]: action.data
                }
            });

        case PROJECT_CREATION.TERMINATE:
            return Object.assign({}, state, {
                isCreating: false
            });


        case DELETE_PROJECT.REQUEST:
            return Object.assign({}, state, {
                isDeleting: true
            });

        case DELETE_PROJECT.RECEIVE:
            let newState = Object.assign({}, state, {
                isDeleting: false,
                items: state.items.filter(p => p.id !== action.projectID),
                itemsByID: {...state.itemsByID}
            });

            if (newState.itemsByID.hasOwnProperty(action.projectID)) {
                delete newState.itemsByID[action.projectID];
            }

            return newState;

        case DELETE_PROJECT.ERROR:
            return Object.assign({}, state, {
                isDeleting: false
            });


        case SAVE_PROJECT.REQUEST:
            return Object.assign({}, state, {
                isSaving: true
            });

        case SAVE_PROJECT.RECEIVE:
            // noinspection JSCheckFunctionSignatures
            return Object.assign({}, state, {
                isSaving: false,
                items: [...state.items.filter(p => p.id !== action.data.id), action.data].sort(projectSort),
                itemsByID: {
                    ...state.itemsByID,
                    [action.data.id]: action.data
                }
            });

        case SAVE_PROJECT.ERROR:
            return Object.assign({}, state, {
                isSaving: false
            });


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
        case PROJECT_CREATION.END:
            // TODO: Might want to re-fetch upon project creation instead...
            return Object.assign({}, state, {
                itemsByProjectID: {
                    ...state.itemsByProjectID,
                    [action.project.id]: []
                }
            });

        case DELETE_PROJECT.RECEIVE:
            let newState = Object.assign({}, state, {
                itemsByProjectID: {...state.itemsByProjectID}
            });

            if (newState.itemsByProjectID.hasOwnProperty(action.projectID)) {
                delete newState.itemsByProjectID[action.projectID];
            }

            return newState;

        case FETCHING_PROJECT_DATASETS.BEGIN:
            return Object.assign({}, state, {
                isFetchingAll: true
            });

        case FETCHING_PROJECT_DATASETS.END:
            return Object.assign({}, state, {
                isFetching: false,
                isFetchingAll: false
            });

        case FETCH_PROJECT_DATASETS.REQUEST:
            return Object.assign({}, state, {
                isFetching: true
            });

        case FETCH_PROJECT_DATASETS.RECEIVE:
            return Object.assign({}, state, {
                isFetching: false,
                itemsByProjectID: {
                    ...state.itemsByProjectID,
                    [action.projectID]: action.data
                }
            });

        case FETCH_PROJECT_DATASETS.ERROR:
            return Object.assign({}, state, {
                isFetching: false
            });

        case PROJECT_DATASET_ADDITION.BEGIN:
            return Object.assign({}, state, {
                isAdding: true
            });

        case PROJECT_DATASET_ADDITION.END:
            // TODO
            return Object.assign({}, state, {
                isAdding: false,
                itemsByProjectID: {
                    ...state.itemsByProjectID,
                    [action.projectID]: [...(state.itemsByProjectID[action.projectID] || []), action.dataset]
                }
            });

        case PROJECT_DATASET_ADDITION.TERMINATE:
            return Object.assign({}, state, {
                isAdding: false
            });

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
            return Object.assign({}, state, {
                selectedProjectID: action.projectID
            });

        case DELETE_PROJECT.RECEIVE:
            return Object.assign({}, state, {
                selectedProjectID: state.selectedProjectID === action.projectID ? null : state.selectedProjectID
            });

        case TOGGLE_PROJECT_CREATION_MODAL:
            return Object.assign({}, state, {
                projectCreationModal: !state.projectCreationModal
            });

        case TOGGLE_PROJECT_DELETION_MODAL:
            return Object.assign({}, state, {
                projectDeletionModal: !state.projectDeletionModal
            });

        case TOGGLE_PROJECT_DATASET_ADDITION_MODAL:
            return Object.assign({}, state, {
                projectDatasetCreationModal: !state.projectDatasetCreationModal
            });

        case PROJECT_EDITING.BEGIN:
            return Object.assign({}, state, {
                editingProject: true
            });

        case PROJECT_EDITING.END:
            return Object.assign({}, state, {
                editingProject: false
            });

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
            return Object.assign({}, state, {
                isFetching: true
            });

        case FETCH_DROP_BOX_TREE.RECEIVE:
            return Object.assign({}, state, {
                isFetching: false,
                tree: action.tree
            });

        case FETCH_DROP_BOX_TREE.ERROR:
            return Object.assign({}, state, {
                isFetching: false
            });

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
            return Object.assign({}, state, {
                isFetching: true,
            });

        case FETCH_RUNS.RECEIVE:
            return Object.assign({}, state, {
                isFetching: false,
                items: action.data
            });

        case FETCH_RUNS.ERROR:
            return Object.assign({}, state, {
                isFetching: false,
            });

        case FETCH_RUN_DETAILS.REQUEST:
            return Object.assign({}, state, {
                itemDetails: {
                    ...state.itemDetails,
                    [action.runID]: {
                        isFetching: true,
                        details: (state.itemDetails[action.runID] || {details: null}).details
                    }
                }
            });

        case FETCH_RUN_DETAILS.RECEIVE:
            return Object.assign({}, state, {
                isFetching: false,
                items: state.items.map(i => i.run_id === action.runID ? {...i, state: action.data.state} : i),
                itemDetails: {
                    ...state.itemDetails,
                    [action.runID]: {
                        isFetching: false,
                        details: action.data
                    }
                }
            });

        case FETCH_RUN_DETAILS.ERROR:
            return Object.assign({}, state, {
                itemDetails: {
                    ...state.itemDetails,
                    [action.runID]: {
                        isFetching: false,
                        details: (state.itemDetails[action.runID] || {details: null}).details
                    }
                }
            });

        case INGESTION_RUN_SUBMISSION.BEGIN:
            return Object.assign({}, state, {
                isSubmittingIngestionRun: true
            });

        case INGESTION_RUN_SUBMISSION.END:
            return Object.assign({}, state, {
                isSubmittingIngestionRun: false
            });

        default:
            return state;
    }
};
