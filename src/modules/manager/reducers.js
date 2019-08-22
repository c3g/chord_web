import {
    RECEIVE_PROJECTS,
    REQUEST_PROJECTS,
    HANDLE_PROJECTS_ERROR,

    BEGIN_PROJECT_CREATION,
    END_PROJECT_CREATION,
    TERMINATE_PROJECT_CREATION,

    SELECT_PROJECT,
    TOGGLE_PROJECT_CREATION_MODAL,
    TOGGLE_PROJECT_DELETION_MODAL
} from "./actions";

export const projects = (
    state = {
        isFetching: false,
        isCreating: false,
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
            // TODO: Check if project exists? or do that in actions
            return Object.assign({}, state, {
                selectedProjectID: action.projectID
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
