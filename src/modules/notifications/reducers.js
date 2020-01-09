import {
    SHOW_NOTIFICATION_DRAWER,
    HIDE_NOTIFICATION_DRAWER,
    ADD_NOTIFICATION,
    FETCH_NOTIFICATIONS,
    MARK_NOTIFICATION_AS_READ,
} from "./actions";

export const notifications = (
    state = {
        isFetching: false,
        isMarkingAsRead: false,
        drawerVisible: false,
        items: [],
        itemsByID: {}
    },
    action
) => {
    switch (action.type) {
        case ADD_NOTIFICATION:
            return {
                ...state,
                items: [...state.items, action.data],
                itemsByID: {
                    ...state.itemsByID,
                    [action.data.id]: action.data
                }
            };

        case FETCH_NOTIFICATIONS.REQUEST:
            return {...state, isFetching: true};

        case FETCH_NOTIFICATIONS.RECEIVE:
            return {
                ...state,
                isFetching: false,
                items: action.data,
                itemsByID: Object.fromEntries(action.data.map(n => [n.id, n]))
            };

        case FETCH_NOTIFICATIONS.ERROR:
            return {...state, isFetching: false};


        case MARK_NOTIFICATION_AS_READ.REQUEST:
            return {...state, isMarkingAsRead: true};

        case MARK_NOTIFICATION_AS_READ.RECEIVE:
            return {
                ...state,
                isMarkingAsRead: false,
                items: state.items.map(i => i.id === action.notificationID ? {...i, read: true} : i),
                itemsByID: {
                    ...state.itemsByID,
                    [action.notificationID]: {
                        ...(state.itemsByID[action.notificationID] || {}),
                        read: true
                    }
                }
            };

        case MARK_NOTIFICATION_AS_READ.ERROR:
            return {...state, isMarkingAsRead: false};


        case SHOW_NOTIFICATION_DRAWER:
            return {...state, drawerVisible: true};

        case HIDE_NOTIFICATION_DRAWER:
            return {...state, drawerVisible: false};


        default:
            return state;
    }
};
