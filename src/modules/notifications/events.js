import {notification} from "antd";
import "antd/es/notification/style/css";

const EVENT_NOTIFICATION = "notification";

const NOTIFICATION_WES_RUN_FAILED = "wes_run_failed";
const NOTIFICATION_WES_RUN_COMPLETED = "wes_run_completed";

export default {
    "^chord.": message => async () => {
        if (message.type === EVENT_NOTIFICATION) return;

        const messageData = message.data || {};
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

        switch (message.data.notification_type) {
            case NOTIFICATION_WES_RUN_FAILED:
                notification.error({
                    ...notificationBasics,
                    onClick: () => {}  // TODO
                });
                break;

            case NOTIFICATION_WES_RUN_COMPLETED:
                notification.success({
                    ...notificationBasics,
                    onClick: () => {}  // TODO
                });
                break;

            default:
                notification.open(notificationBasics)
        }
    }
};
