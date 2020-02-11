import {notification} from "antd";
import "antd/es/notification/style/css";

import {addNotification, markNotificationAsRead} from "./actions";
import {navigateToWESRun} from "../../notifications";
import {urlPath} from "../../utils";

const EVENT_NOTIFICATION = "notification";

const NOTIFICATION_WES_RUN_FAILED = "wes_run_failed";
const NOTIFICATION_WES_RUN_COMPLETED = "wes_run_completed";

export default {
    [/^chord\.service\.notification$/.source]: (message, history) => async (dispatch, getState) => {
        if (message.type !== EVENT_NOTIFICATION) return;

        const nodeBasePath = getState().nodeInfo.data.CHORD_URL ? urlPath(getState().nodeInfo.data.CHORD_URL) : "/";

        const messageData = message.data || {};

        await dispatch(addNotification(messageData));

        const notificationData = {
            // Assume message data has at least ID, title, description, and read, although it should have everything
            ...messageData,
            notification_type: messageData.notification_type || "generic",
            action_target: messageData.action_target || null
        };

        const notificationBasics = {
            message: notificationData.title,
            description: notificationData.description
        };

        const wesClickAction = () => {
            dispatch(markNotificationAsRead(notificationData.id));
            dispatch(navigateToWESRun(notificationData.action_target, dispatch, history, nodeBasePath));
        };

        switch (message.data.notification_type) {
            case NOTIFICATION_WES_RUN_FAILED:
                notification.error({
                    ...notificationBasics,
                    onClick: wesClickAction
                });
                break;

            case NOTIFICATION_WES_RUN_COMPLETED:
                notification.success({
                    ...notificationBasics,
                    onClick: wesClickAction
                });
                break;

            default:
                notification.open(notificationBasics)
        }
    }
};
