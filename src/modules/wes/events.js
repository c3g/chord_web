import {receiveRunDetails} from "./actions";

const EVENT_WES_RUN_UPDATED = "wes_run_updated";

export default {
    "^chord.service.wes$": message => async dispatch => {
        if (message.type === EVENT_WES_RUN_UPDATED) {
            await dispatch(receiveRunDetails(message.data.run_id, message.data));
        }
    }
}
