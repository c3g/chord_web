import {
    TOGGLE_PROJECT_CREATION_MODAL,
    TOGGLE_PROJECT_DELETION_MODAL,

    PROJECT_EDITING,

    FETCH_DROP_BOX_TREE,
} from "./actions";


export const manager = (
    state = {
        projectCreationModal: false,
        projectDeletionModal: false,
        editingProject: false
    },
    action
) => {
    switch (action.type) {
        case TOGGLE_PROJECT_CREATION_MODAL:
            return {...state, projectCreationModal: !state.projectCreationModal};

        case TOGGLE_PROJECT_DELETION_MODAL:
            return {...state, projectDeletionModal: !state.projectDeletionModal};

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
