import {basicAction, createNetworkActionTypes, networkAction} from "../../utils/actions";

export const SHOW_NOTIFICATION_DRAWER = "SHOW_NOTIFICATION_DRAWER";
export const HIDE_NOTIFICATION_DRAWER = "HIDE_NOTIFICATION_DRAWER";

export const showNotificationDrawer = basicAction(SHOW_NOTIFICATION_DRAWER);
export const hideNotificationDrawer = basicAction(HIDE_NOTIFICATION_DRAWER);

export const FETCH_NOTIFICATIONS = createNetworkActionTypes("FETCH_NOTIFICATIONS");

export const fetchNotifications = networkAction(() => (dispatch, getState) => ({
    types: FETCH_NOTIFICATIONS,
    url: `${getState().services.notificationService.url}/notifications`,
    err: "Error fetching notifications"
}));
