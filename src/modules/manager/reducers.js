import {
    RECEIVE_PROJECTS,
    REQUEST_PROJECTS,
    HANDLE_PROJECTS_ERROR,

    BEGIN_FETCHING_PROJECT_DATASETS,
    END_FETCHING_PROJECT_DATASETS,
    REQUEST_PROJECT_DATASETS,
    RECEIVE_PROJECT_DATASETS,
    HANDLE_PROJECT_DATASETS_ERROR,

    BEGIN_PROJECT_CREATION,
    END_PROJECT_CREATION,
    TERMINATE_PROJECT_CREATION,

    BEGIN_PROJECT_DELETION,
    END_PROJECT_DELETION,
    TERMINATE_PROJECT_DELETION,

    SELECT_PROJECT,

    BEGIN_PROJECT_DATASET_ADDITION,
    END_PROJECT_DATASET_ADDITION,
    TERMINATE_PROJECT_DATASET_CREATION,

    TOGGLE_PROJECT_CREATION_MODAL,
    TOGGLE_PROJECT_DELETION_MODAL,
    TOGGLE_PROJECT_DATASET_ADDITION_MODAL,

    BEGIN_PROJECT_EDITING,
    END_PROJECT_EDITING,

    BEGIN_PROJECT_SAVE,
    END_PROJECT_SAVE,
    TERMINATE_PROJECT_SAVE,

    REQUEST_DROP_BOX_TREE,
    RECEIVE_DROP_BOX_TREE,

    REQUEST_RUNS,
    RECEIVE_RUNS,

    REQUEST_RUN_DETAILS,
    RECEIVE_RUN_DETAILS,

    BEGIN_INGESTION_RUN_SUBMISSION,
    END_INGESTION_RUN_SUBMISSION
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
        case REQUEST_PROJECTS:
            return Object.assign({}, state, {
                isFetching: true
            });

        case RECEIVE_PROJECTS:
            return Object.assign({}, state, {
                isFetching: false,
                items: action.projects.sort(projectSort),
                itemsByID: Object.assign({}, ...action.projects.map(p => ({[p.id]: p}))),
            });

        case HANDLE_PROJECTS_ERROR:
            return Object.assign({}, state, {
                isFetching: false
            });


        case BEGIN_PROJECT_CREATION:
            return Object.assign({}, state, {
                isCreating: true
            });

        case END_PROJECT_CREATION:
            return Object.assign({}, state, {
                isCreating: false,
                items: [...state.items, action.project].sort(projectSort),
                itemsByID: {
                    ...state.itemsByID,
                    [action.project.id]: action.project
                }
            });

        case TERMINATE_PROJECT_CREATION:
            return Object.assign({}, state, {
                isCreating: false
            });


        case BEGIN_PROJECT_DELETION:
            return Object.assign({}, state, {
                isDeleting: true
            });

        case END_PROJECT_DELETION:
            let newState = Object.assign({}, state, {
                isDeleting: false,
                items: state.items.filter(p => p.id !== action.projectID),
                itemsByID: {...state.itemsByID}
            });

            if (newState.itemsByID.hasOwnProperty(action.projectID)) {
                delete newState.itemsByID[action.projectID];
            }

            return newState;

        case TERMINATE_PROJECT_DELETION:
            return Object.assign({}, state, {
                isDeleting: false
            });


        case BEGIN_PROJECT_SAVE:
            return Object.assign({}, state, {
                isSaving: true
            });

        case END_PROJECT_SAVE:
            return Object.assign({}, state, {
                isSaving: false,
                items: [...state.items.filter(p => p.id !== action.project.id), action.project].sort(projectSort),
                itemsByID: {
                    ...state.itemsByID,
                    [action.project.id]: action.project
                }
            });

        case TERMINATE_PROJECT_SAVE:
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
        case END_PROJECT_CREATION:
            // TODO: Might want to re-fetch upon project creation instead...
            return Object.assign({}, state, {
                itemsByProjectID: {
                    ...state.itemsByProjectID,
                    [action.project.id]: []
                }
            });

        case END_PROJECT_DELETION:
            let newState = Object.assign({}, state, {
                isDeleting: false,
                itemsByProjectID: {...state.itemsByProjectID}
            });

            if (newState.itemsByProjectID.hasOwnProperty(action.projectID)) {
                delete newState.itemsByProjectID[action.projectID];
            }

            return newState;

        case BEGIN_FETCHING_PROJECT_DATASETS:
            return Object.assign({}, state, {
                isFetchingAll: true
            });

        case END_FETCHING_PROJECT_DATASETS:
            return Object.assign({}, state, {
                isFetching: false,
                isFetchingAll: false
            });

        case REQUEST_PROJECT_DATASETS:
            return Object.assign({}, state, {
                isFetching: true
            });

        case RECEIVE_PROJECT_DATASETS:
            return Object.assign({}, state, {
                isFetching: false,
                itemsByProjectID: {
                    ...state.itemsByProjectID,
                    [action.projectID]: action.datasets
                }
            });

        case HANDLE_PROJECT_DATASETS_ERROR:
            return Object.assign({}, state, {
                isFetching: false
            });

        case BEGIN_PROJECT_DATASET_ADDITION:
            return Object.assign({}, state, {
                isAdding: true
            });

        case END_PROJECT_DATASET_ADDITION:
            // TODO
            return Object.assign({}, state, {
                isAdding: false,
                itemsByProjectID: {
                    ...state.itemsByProjectID,
                    [action.projectID]: [...(state.itemsByProjectID[action.projectID] || []), action.dataset]
                }
            });

        case TERMINATE_PROJECT_DATASET_CREATION:
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

        case END_PROJECT_DELETION:
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

        case BEGIN_PROJECT_EDITING:
            return Object.assign({}, state, {
                editingProject: true
            });

        case END_PROJECT_EDITING:
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
        case REQUEST_DROP_BOX_TREE:
            return Object.assign({}, state, {
                isFetching: true
            });

        case RECEIVE_DROP_BOX_TREE:
            return Object.assign({}, state, {
                isFetching: false,
                tree: action.tree
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
        case REQUEST_RUNS:
            return Object.assign({}, state, {
                isFetching: true,
            });

        case RECEIVE_RUNS:
            return Object.assign({}, state, {
                isFetching: false,
                items: action.runs
            });

        case REQUEST_RUN_DETAILS:
            return Object.assign({}, state, {
                itemDetails: {
                    ...state.itemDetails,
                    [action.runID]: {
                        isFetching: true,
                        details: (state.itemDetails[action.runID] || {details: null}).details
                    }
                }
            });

        case RECEIVE_RUN_DETAILS:
            return Object.assign({}, state, {
                isFetching: false,
                items: state.items.map(i => i.run_id === action.runID ? {...i, state: action.details.state} : i),
                itemDetails: {
                    ...state.itemDetails,
                    [action.runID]: {
                        isFetching: false,
                        details: action.details
                    }
                }
            });

        case BEGIN_INGESTION_RUN_SUBMISSION:
            return Object.assign({}, state, {
                isSubmittingIngestionRun: true
            });

        case END_INGESTION_RUN_SUBMISSION:
            return Object.assign({}, state, {
                isSubmittingIngestionRun: false
            });

        default:
            return state;
    }
};
