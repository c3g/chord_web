import {createNetworkActionTypes, networkAction} from "../../utils/actions";

export const FETCH_SYSTEM_LOGS = createNetworkActionTypes("FETCH_SYSTEM_LOGS");
export const FETCH_SERVICE_LOGS = createNetworkActionTypes("FETCH_SERVICE_LOGS");

const fetchSystemLogs = networkAction(() => (dispatch, getState) => ({
    types: FETCH_SYSTEM_LOGS,
    url: `${getState().services.logService.url}/system-logs`,
    err: "Error fetching system logs",
}));

export const fetchSystemLogsIfPossible = () => (dispatch, getState) => {
    if (getState().logs.system.isFetching) return;
    return dispatch(fetchSystemLogs());
};

const fetchServiceLogs = networkAction(() => (dispatch, getState) => ({
    types: FETCH_SERVICE_LOGS,
    url: `${getState().services.logService.url}/service-logs`,
    err: "Error fetching service logs",
}));

export const fetchServiceLogsIfPossible = () => (dispatch, getState) => {
    if (getState().logs.service.isFetching) return;
    return dispatch(fetchServiceLogs());
};
