import {
    RECEIVE_PROJECTS,
    REQUEST_PROJECTS,
    HANDLE_PROJECTS_ERROR,

    BEGIN_PROJECT_CREATION,
    END_PROJECT_CREATION,
    TERMINATE_PROJECT_CREATION
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
            console.log(action);
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
