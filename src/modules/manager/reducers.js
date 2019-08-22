import {
    RECEIVE_PROJECTS,
    REQUEST_PROJECTS,
    HANDLE_PROJECTS_ERROR,

    BEGIN_PROJECT_CREATION,
    END_PROJECT_CREATION,
    TERMINATE_PROJECT_CREATION,

    BEGIN_PROJECT_DELETION,
    END_PROJECT_DELETION,
    TERMINATE_PROJECT_DELETION,

    SELECT_PROJECT,
    TOGGLE_PROJECT_CREATION_MODAL,
    TOGGLE_PROJECT_DELETION_MODAL
} from "./actions";

export const projects = (
    state = {
        isFetching: false,
        isCreating: false,
        isDeleting: false,
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
                items: action.projects,
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
                items: [...state.items, action.project],
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


        default:
            return state;
    }
};

export const manager = (
    state = {
        selectedProjectID: null,
        projectCreationModal: false,
        projectDeletionModal: false
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

        default:
            return state;
    }
};
