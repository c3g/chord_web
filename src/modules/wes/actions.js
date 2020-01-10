import {message} from "antd";

import "antd/es/message/style/css";

import {urlPath} from "../../utils";
import {createNetworkActionTypes, networkAction} from "../../utils/actions";
import {createFormData} from "../../utils/requests";

export const FETCH_RUNS = createNetworkActionTypes("FETCH_RUNS");
export const FETCH_RUN_DETAILS = createNetworkActionTypes("FETCH_RUN_DETAILS");

export const SUBMIT_INGESTION_RUN = createNetworkActionTypes("SUBMIT_INGESTION_RUN");


// TODO: If needed
export const fetchRuns = networkAction(() => (dispatch, getState) => ({
    types: FETCH_RUNS,
    url: `${getState().services.wesService.url}/runs?with_details=true`,
    err: "Error fetching WES runs"
}));

export const receiveRunDetails = (runID, data) => ({
    type: FETCH_RUN_DETAILS.RECEIVE,
    runID,
    data
});

export const fetchRunDetails = networkAction(runID => (dispatch, getState) => ({
    types: FETCH_RUN_DETAILS,
    params: {runID},
    url: `${getState().services.wesService.url}/runs/${runID}`,
    err: `Error fetching run details for run ${runID}`
}));


const RUN_DONE_STATES = ["COMPLETE", "EXECUTOR_ERROR", "SYSTEM_ERROR", "CANCELED"];

export const fetchRunDetailsIfNeeded = runID => async (dispatch, getState) => {
    const state = getState();

    const needsUpdate = !state.runs.itemsByID.hasOwnProperty(runID)
        || (!state.runs.itemsByID[runID].isFetching && (
            !state.runs.itemsByID[runID].details ||
            (!RUN_DONE_STATES.includes(state.runs.itemsByID[runID].state) &&
                state.runs.itemsByID[runID].details.run_log.exit_code === null &&
                state.runs.itemsByID[runID].details.run_log.end_time === "")));

    if (needsUpdate) await dispatch(fetchRunDetails(runID));
};

export const fetchAllRunDetailsIfNeeded = () => async (dispatch, getState) => {
    await Promise.all(getState().runs.items.map(r => dispatch(fetchRunDetailsIfNeeded(r.run_id))));
};


export const submitIngestionWorkflowRun = networkAction(
    (serviceInfo, datasetID, workflow, inputs, redirect, hist) => (dispatch, getState) => ({
        types: SUBMIT_INGESTION_RUN,
        params: {serviceInfo, datasetID},
        url: `${getState().services.wesService.url}/runs`,
        req: {
            method: "POST",
            body: createFormData({
                workflow_params: Object.fromEntries(Object.entries(inputs)
                    .map(([k, v]) => [`${workflow.id}.${k}`, v])),
                workflow_type: "WDL",  // TODO: Should eventually not be hard-coded
                workflow_type_version: "1.0",  // TODO: "
                workflow_engine_parameters: {},  // TODO: Currently unused
                workflow_url: `${serviceInfo.url}/workflows/${workflow.id}.wdl`,
                tags: {
                    workflow_id: workflow.id,
                    workflow_metadata: workflow,
                    ingestion_path: `${urlPath(serviceInfo.url)}/private/ingest`,
                    dataset_id: datasetID  // TODO
                }
            })
        },
        err: "Error submitting ingestion workflow",
        onSuccess: async data => {
            await dispatch(fetchRuns());  // TODO: Maybe just load delta?
            message.success(`Ingestion with run ID "${data.run_id}" submitted!`);
            if (redirect) hist.push(redirect);
        }
    }));
