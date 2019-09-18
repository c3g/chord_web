import {createNetworkActionTypes, networkAction} from "../../utils";

export const FETCH_RUNS = createNetworkActionTypes("FETCH_RUNS");
export const FETCH_RUN_DETAILS = createNetworkActionTypes("FETCH_RUN_DETAILS");

export const SUBMIT_INGESTION_RUN = createNetworkActionTypes("SUBMIT_INGESTION_RUN");


// TODO: If needed
export const fetchRuns = networkAction(() => ({
    types: FETCH_RUNS,
    url: "/api/wes/runs",
    err: "Error fetching WES runs"
}));

export const fetchRunDetails = networkAction(runID => ({
    types: FETCH_RUN_DETAILS,
    params: {runID},
    url: `/api/wes/runs/${runID}`,
    err: `Error fetching run details for run ${runID}`
}));


const RUN_DONE_STATES = ["COMPLETE", "EXECUTOR_ERROR", "SYSTEM_ERROR", "CANCELED"];

export const fetchRunDetailsIfNeeded = runID => async (dispatch, getState) => {
    const state = getState();

    const needsUpdate = !state.runs.itemDetails.hasOwnProperty(runID)
        || (!state.runs.itemDetails[runID].isFetching && (!state.runs.itemDetails[runID].details
            || !RUN_DONE_STATES.includes(state.runs.itemDetails[runID].details.state)));

    if (needsUpdate) await dispatch(fetchRunDetails(runID));
};


export const submitIngestionWorkflowRun = networkAction(
    (serviceID, datasetID, workflow, inputs, redirect, hist) => (dispatch, getState) => {
        const targetBaseURL = `${window.location.origin}/api/${getState().services.itemsByID[serviceID].name}`;
        return {
            types: SUBMIT_INGESTION_RUN,
            params: {serviceID, datasetID},
            url: "/api/wes/runs",
            req: {
                method: "POST",
                body: createFormData({
                    workflow_params: Object.fromEntries(Object.entries(inputs)
                        .map(([k, v]) => [`${workflow.id}.${k}`, v])),
                    workflow_type: "WDL",  // TODO: Should eventually not be hard-coded
                    workflow_type_version: "1.0",  // TODO: "
                    workflow_engine_parameters: {},  // TODO: Currently unused
                    workflow_url: `${targetBaseURL}/workflows/${workflow.id}.wdl`,
                    tags: {
                        workflow_id: workflow.id,
                        workflow_metadata: workflow,
                        ingestion_url: `${targetBaseURL}/ingest`,
                        dataset_id: datasetID  // TODO
                    }
                })
            },
            err: "Error submitting ingestion workflow",
            afterAction: fetchRuns,  // TODO: Maybe just load delta?
            onSuccess: data => {
                message.success(`Ingestion with run ID "${data.run_id}" submitted!`);
                if (redirect) hist.push(redirect);
            }
        };
    });
