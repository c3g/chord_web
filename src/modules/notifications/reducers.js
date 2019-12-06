import {SHOW_NOTIFICATION_DRAWER, HIDE_NOTIFICATION_DRAWER, FETCH_NOTIFICATIONS} from "./actions";

export const notifications = (
    state = {
        isFetching: false,
        drawerVisible: false,
        items: []
    },
    action
) => {
    switch (action.type) {
        case FETCH_NOTIFICATIONS.REQUEST:
            return {...state, isFetching: true};
        case FETCH_NOTIFICATIONS.RECEIVE:
            return {...state, isFetching: false, items: action.data};
        case FETCH_NOTIFICATIONS.ERROR:
            return {...state, isFetching: false};

        case SHOW_NOTIFICATION_DRAWER:
            return {...state, drawerVisible: true};
        case HIDE_NOTIFICATION_DRAWER:
            return {...state, drawerVisible: false};

        default:
            return state;
    }
};
