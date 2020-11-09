import {hideNotificationDrawer} from "../modules/notifications/actions";
import {withBasePath} from "./url";

export const NOTIFICATION_WES_RUN_COMPLETED = "wes_run_completed";
export const NOTIFICATION_WES_RUN_FAILED = "wes_run_failed";

export const navigateToWESRun = async (target, dispatch, history) => {
    await dispatch(hideNotificationDrawer());
    history.push(withBasePath(`admin/data/manager/runs/${target}/request`));
};
