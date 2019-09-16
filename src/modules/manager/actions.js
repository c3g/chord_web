import fetch from "cross-fetch";
import {message} from "antd";

import {beginAddingServiceDataset, endAddingServiceDataset, terminateAddingServiceDataset} from "../services/actions";

import {basicAction} from "../../utils";

export const REQUEST_PROJECTS = "REQUEST_PROJECTS";
const requestProjects = basicAction(REQUEST_PROJECTS);

export const RECEIVE_PROJECTS = "RECEIVE_PROJECTS";
const receiveProjects = projects => ({
    type: RECEIVE_PROJECTS,
    projects
});

export const HANDLE_PROJECTS_ERROR = "HANDLE_PROJECTS_ERROR";
const handleProjectsError = basicAction(HANDLE_PROJECTS_ERROR);


export const BEGIN_FETCHING_PROJECT_DATASETS = "BEGIN_FETCHING_PROJECT_DATASETS";
const beginFetchingProjectDatasets = basicAction(BEGIN_FETCHING_PROJECT_DATASETS);

export const END_FETCHING_PROJECT_DATASETS = "END_FETCHING_PROJECT_DATASETS";
const endFetchingProjectDatasets = basicAction(END_FETCHING_PROJECT_DATASETS);

export const REQUEST_PROJECT_DATASETS = "REQUEST_PROJECT_DATASETS";
const requestProjectDatasets = basicAction(REQUEST_PROJECT_DATASETS);

export const RECEIVE_PROJECT_DATASETS = "RECEIVE_PROJECT_DATASETS";
const receiveProjectDatasets = (projectID, datasets) => ({
    type: RECEIVE_PROJECT_DATASETS,
    projectID,
    datasets
});

export const HANDLE_PROJECT_DATASETS_ERROR = "HANDLE_PROJECT_DATASETS_ERROR";
const handleProjectDatasetsError = basicAction(HANDLE_PROJECT_DATASETS_ERROR);


export const BEGIN_PROJECT_CREATION = "BEGIN_PROJECT_CREATION";
const beginProjectCreation = basicAction(BEGIN_PROJECT_CREATION);

export const END_PROJECT_CREATION = "END_PROJECT_CREATION";
const endProjectCreation = project => ({
    type: END_PROJECT_CREATION,
    project
});

export const TERMINATE_PROJECT_CREATION = "TERMINATE_PROJECT_CREATION";
const terminateProjectCreation = basicAction(TERMINATE_PROJECT_CREATION);


export const BEGIN_PROJECT_DELETION = "BEGIN_PROJECT_DELETION";
const beginProjectDeletion = basicAction(BEGIN_PROJECT_DELETION);

export const END_PROJECT_DELETION = "END_PROJECT_DELETION";
const endProjectDeletion = projectID => ({
    type: END_PROJECT_DELETION,
    projectID
});

export const TERMINATE_PROJECT_DELETION = "TERMINATE_PROJECT_DELETION";
const terminateProjectDeletion = basicAction(TERMINATE_PROJECT_DELETION);


export const SELECT_PROJECT = "SELECT_PROJECT";
const selectProject = projectID => ({
    type: SELECT_PROJECT,
    projectID
});

export const selectProjectIfItExists = projectID => async (dispatch, getState) => {
    if (!getState().projects.itemsByID.hasOwnProperty(projectID)) return;
    await dispatch(selectProject(projectID));
};


export const BEGIN_PROJECT_DATASET_ADDITION = "BEGIN_PROJECT_DATASET_ADDITION";
const beginProjectDatasetAddition = basicAction(BEGIN_PROJECT_DATASET_ADDITION);

export const END_PROJECT_DATASET_ADDITION = "END_PROJECT_DATASET_ADDITION";
const endProjectDatasetAddition = (projectID, dataset) => ({
    type: END_PROJECT_DATASET_ADDITION,
    projectID,
    dataset
});

export const TERMINATE_PROJECT_DATASET_CREATION = "TERMINATE_PROJECT_DATASET_CREATION";
const terminateProjectDatasetAddition = basicAction(TERMINATE_PROJECT_DATASET_CREATION);


export const TOGGLE_PROJECT_CREATION_MODAL = "TOGGLE_PROJECT_CREATION_MODAL";
export const toggleProjectCreationModal = basicAction(TOGGLE_PROJECT_CREATION_MODAL);

export const TOGGLE_PROJECT_DELETION_MODAL = "TOGGLE_PROJECT_DELETION_MODAL";
export const toggleProjectDeletionModal = basicAction(TOGGLE_PROJECT_DELETION_MODAL);

export const TOGGLE_PROJECT_DATASET_ADDITION_MODAL = "TOGGLE_PROJECT_DATASET_ADDITION_MODAL";
export const toggleProjectDatasetAdditionModal = basicAction(TOGGLE_PROJECT_DATASET_ADDITION_MODAL);

export const BEGIN_PROJECT_EDITING = "BEGIN_PROJECT_EDITING";
export const beginProjectEditing = basicAction(BEGIN_PROJECT_EDITING);

export const END_PROJECT_EDITING = "END_PROJECT_EDITING";
export const endProjectEditing = basicAction(END_PROJECT_EDITING);

export const BEGIN_PROJECT_SAVE = "BEGIN_PROJECT_SAVE";
export const beginProjectSave = projectID => ({
    type: BEGIN_PROJECT_SAVE,
    projectID
});

export const END_PROJECT_SAVE = "END_PROJECT_SAVE";
export const endProjectSave = project => ({
    type: END_PROJECT_SAVE,
    project
});

export const TERMINATE_PROJECT_SAVE = "TERMINATE_PROJECT_SAVE";
export const terminateProjectSave = project => ({
    type: TERMINATE_PROJECT_SAVE,
    project
});


export const REQUEST_DROP_BOX_TREE = "REQUEST_DROP_BOX_TREE";
export const requestDropBoxTree = basicAction(REQUEST_DROP_BOX_TREE);

export const RECEIVE_DROP_BOX_TREE = "RECEIVE_DROP_BOX_TREE";
export const receiveDropBoxTree = tree => ({
    type: RECEIVE_DROP_BOX_TREE,
    tree
});


export const REQUEST_RUNS = "REQUEST_RUNS";
export const requestRuns = basicAction(REQUEST_RUNS);

export const RECEIVE_RUNS = "RECEIVE_RUNS";
export const receiveRuns = runs => ({
    type: RECEIVE_RUNS,
    runs
});

export const REQUEST_RUN_DETAILS = "REQUEST_RUN_DETAILS";
export const requestRunDetails = runID => ({
    type: REQUEST_RUN_DETAILS,
    runID
});

export const RECEIVE_RUN_DETAILS = "RECEIVE_RUN_DETAILS";
export const receiveRunDetails = (runID, details) => ({
    type: RECEIVE_RUN_DETAILS,
    runID,
    details
});


export const BEGIN_INGESTION_RUN_SUBMISSION = "BEGIN_INGESTION_RUN_SUBMISSION";
export const beginIngestionRunSubmission = basicAction(BEGIN_INGESTION_RUN_SUBMISSION);

export const END_INGESTION_RUN_SUBMISSION = "END_INGESTION_RUN_SUBMISSION";
export const endIngestionRunSubmission = basicAction(END_INGESTION_RUN_SUBMISSION);


// TODO: if needed fetching + invalidation
export const fetchProjectsWithDatasets = () => async (dispatch, getState) => {
    if (getState().projects.isFetching || getState().projects.isCreating || getState().projects.isDeleting) return;

    await dispatch(requestProjects());

    try {
        const response = await fetch("/api/project/projects");
        if (!response.ok) {
            // TODO: GUI error message
            console.error(response);
            await dispatch(handleProjectsError());
            return;
        }

        const data = await response.json();
        await dispatch(receiveProjects(data));

        await dispatch(beginFetchingProjectDatasets());

        for (let project of getState().projects.items) {
            await dispatch(requestProjectDatasets());

            const dsResponse = await fetch(`/api/project/projects/${project.id}/datasets`);
            if (dsResponse.ok) {
                const datasets = await dsResponse.json();
                await dispatch(receiveProjectDatasets(project.id, datasets));
            } else {
                // TODO: GUI Error message
                console.error(dsResponse);
                await dispatch(handleProjectDatasetsError());
            }
        }

        await dispatch(endFetchingProjectDatasets());
    } catch (e) {
        // TODO: GUI error message
        console.error(e);
        await dispatch(handleProjectsError());
        await dispatch(endFetchingProjectDatasets());
    }
};

export const createProject = project => async (dispatch, getState) => {
    // TODO: Need object response from POST

    if (getState().projects.isCreating) return;

    await dispatch(beginProjectCreation());

    try {
        const response = await fetch("/api/project/projects", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(project)
        });

        if (response.ok) {
            // Created
            const data = await response.json();
            await dispatch(endProjectCreation(data));
            await dispatch(selectProject(data.id));
        } else {
            // TODO: GUI error message
            console.error(response);
            await dispatch(terminateProjectCreation());
        }
    } catch (e) {
        // TODO: GUI error message
        console.error(e);
        await dispatch(terminateProjectCreation());
    }
};

export const deleteProject = projectID => async (dispatch, getState) => {
    if (getState().projects.isDeleting) return;

    await dispatch(beginProjectDeletion());

    try {
        const response = await fetch(`/api/project/projects/${projectID}`, {method: "DELETE"});
        if (response.ok) {
            await dispatch(endProjectDeletion(projectID));
            // TODO: Fix project selection
        } else {
            // TODO: GUI error message
            console.error(response);
            await dispatch(terminateProjectDeletion());
        }
    } catch (e) {
        // TODO: GUI error message
        console.error(e);
        await dispatch(terminateProjectDeletion());
    }
};

export const saveProject = project => async (dispatch, getState) => {
    if (getState().projects.isDeleting) return;
    if (getState().projects.isSaving) return;

    await dispatch(beginProjectSave(project.id));

    try {
        const response = await fetch(`/api/project/projects/${project.id}`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(project)
        });

        if (response.ok) {
            const data = await response.json();
            await dispatch(endProjectEditing());
            await dispatch(endProjectSave(data));
        } else {
            // TODO: GUI error message
            console.error(response);
            await dispatch(terminateProjectSave());
        }
    } catch (e) {
        // TODO: GUI error message
        console.error(e);
        await dispatch(terminateProjectSave());
    }
};


export const addProjectDataset = (projectID, serviceID, dataTypeID, datasetName) => async (dispatch, getState) => {
    if (getState().projectDatasets.isAdding) return;

    await dispatch(beginProjectDatasetAddition());
    await dispatch(beginAddingServiceDataset());

    try {
        const formData = new FormData();
        formData.append("name", datasetName.trim());

        const serviceResponse = await fetch(
            `/api/${getState().services.itemsByID[serviceID].name}/datasets?data-type=${dataTypeID}`,
            {method: "POST", body: formData});

        if (serviceResponse.ok) {
            const serviceDataset = await serviceResponse.json();

            const projectResponse = await fetch(`/api/project/projects/${projectID}/datasets`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    dataset_id: serviceDataset.id,
                    service_id: serviceID,
                    data_type_id: dataTypeID
                })
            });

            if (projectResponse.ok) {
                // TODO: GUI success message
                const projectDataset = await projectResponse.json();
                await dispatch(endAddingServiceDataset(serviceID, dataTypeID, serviceDataset));
                await dispatch(endProjectDatasetAddition(projectID, projectDataset));
            } else {
                // TODO: Delete previously-created dataset
                // TODO: GUI error message
                console.error(projectResponse);
                await dispatch(terminateAddingServiceDataset());
                await dispatch(terminateProjectDatasetAddition());
            }
        } else {
            // TODO: GUI error message
            console.error(serviceResponse);
            await dispatch(terminateAddingServiceDataset());
            await dispatch(terminateProjectDatasetAddition());
        }
    } catch (e) {
        // TODO: Delete previously-created dataset if needed, or add another try-catch level
        // TODO: GUI error message
        console.error(e);
        await dispatch(terminateAddingServiceDataset());
        await dispatch(terminateProjectDatasetAddition());
    }
};


// TODO: If needed
export const fetchDropBoxTree = () => async dispatch => {
    await dispatch(requestDropBoxTree());

    try {
        const response = await fetch(`/api/drop_box/tree`);
        if (response.ok) {
            const tree = await response.json();
            await dispatch(receiveDropBoxTree(tree));
        } else {
            // TODO: GUI error message
            // TODO: Don't "receive" anything...
            console.error(response);
            await dispatch(receiveDropBoxTree([]));
        }
    } catch (e) {
        // TODO: GUI error message
        // TODO: Don't "receive" anything...
        console.error(e);
        await dispatch(receiveDropBoxTree([]));
    }
};


// TODO: If needed
export const fetchRuns = () => async dispatch => {
    await dispatch(requestRuns());

    try {
        const response = await fetch("/api/wes/runs");
        if (response.ok) {
            const runs = await response.json();
            await dispatch(receiveRuns(runs));
        } else {
            // TODO: GUI error message
            // TODO: Don't "receive" anything...
            console.error(response);
            await dispatch(receiveRuns([]));

        }
    } catch (e) {
        // TODO: GUI error message
        // TODO: Don't "receive" anything...
        console.error(e);
        await dispatch(receiveRuns([]));
    }
};


export const fetchRunDetails = runID => async dispatch => {
    await dispatch(requestRunDetails(runID));

    try {
        const response = await fetch(`/api/wes/runs/${runID}`);
        if (response.ok) {
            const runDetails = await response.json();
            await dispatch(receiveRunDetails(runID, runDetails));
        } else {
            // TODO: GUI error message
            // TODO: Don't "receive" anything...
            console.error(response);
            await dispatch(receiveRunDetails(runID, null));
        }
    } catch (e) {
        // TODO: GUI error message
        // TODO: Don't "receive" anything...
        console.error(e);
        await dispatch(receiveRunDetails(runID, null));
    }
};

const RUN_DONE_STATES = ["COMPLETE", "EXECUTOR_ERROR", "SYSTEM_ERROR", "CANCELED"];

export const fetchRunDetailsIfNeeded = runID => async (dispatch, getState) => {
    const state = getState();

    const needsUpdate = !state.runs.itemDetails.hasOwnProperty(runID)
        || (!state.runs.itemDetails[runID].isFetching && (!state.runs.itemDetails[runID].details
            || !RUN_DONE_STATES.includes(state.runs.itemDetails[runID].details.state)));

    if (needsUpdate) await dispatch(fetchRunDetails(runID));
};


export const submitIngestionWorkflowRun = (serviceID, datasetID, workflow, inputs, redirect, history) =>
    async (dispatch, getState) => {
        await dispatch(beginIngestionRunSubmission());

        const serviceName = getState().services.itemsByID[serviceID].name;
        let namespacedInputs = Object.fromEntries(Object.entries(inputs).map(([k, v]) => [`${workflow.id}.${k}`, v]));

        // TODO: Need to handle files properly for file inputs

        try {
            const formData = new FormData();

            formData.append("workflow_params", JSON.stringify(namespacedInputs));
            formData.append("workflow_type", "WDL");  // TODO: Should eventually not be hard-coded
            formData.append("workflow_type_version", "1.0");  // TODO: "
            formData.append("workflow_engine_parameters", JSON.stringify({}));  // TODO: Currently unused
            formData.append("workflow_url",
                `${window.location.origin}/api/${serviceName}/workflows/${workflow.id}.wdl`);
            formData.append("tags", JSON.stringify({
                workflow_id: workflow.id,
                workflow_metadata: workflow,
                ingestion_url: `${window.location.origin}/api/${serviceName}/ingest`,
                dataset_id: datasetID  // TODO
            }));

            const response = await fetch("/api/wes/runs", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                const runID = (await response.json())["run_id"];
                message.success(`Ingestion with run ID "${runID}" submitted!`);

                await dispatch(fetchRuns());  // TODO: Maybe just load delta?
                // TODO: Navigate to workflow runs and scroll to the correct entry

                if (redirect) {
                    history.push(redirect);
                }
            } else {
                // TODO: GUI error message
                console.error(response);
            }
        } catch (e) {
            // TODO: GUI error message
            console.error(e);
            // TODO: Emit event
        }

        // TODO: Separate event for success/failure?
        await dispatch(endIngestionRunSubmission());
    };
