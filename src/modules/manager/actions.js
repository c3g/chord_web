import fetch from "cross-fetch";

import {message} from "antd";

export const REQUEST_PROJECTS = "REQUEST_PROJECTS";
const requestProjects = () => ({
    type: REQUEST_PROJECTS
});

export const RECEIVE_PROJECTS = "RECEIVE_PROJECTS";
const receiveProjects = projects => ({
    type: RECEIVE_PROJECTS,
    projects
});

export const HANDLE_PROJECTS_ERROR = "HANDLE_PROJECTS_ERROR";
const handleProjectsError = () => ({
    type: HANDLE_PROJECTS_ERROR
});


export const BEGIN_FETCHING_PROJECT_DATASETS = "BEGIN_FETCHING_PROJECT_DATASETS";
const beginFetchingProjectDatasets = () => ({
    type: BEGIN_FETCHING_PROJECT_DATASETS
});

export const END_FETCHING_PROJECT_DATASETS = "END_FETCHING_PROJECT_DATASETS";
const endFetchingProjectDatasets = () => ({
    type: END_FETCHING_PROJECT_DATASETS
});

export const REQUEST_PROJECT_DATASETS = "REQUEST_PROJECT_DATASETS";
const requestProjectDatasets = () => ({
    type: REQUEST_PROJECT_DATASETS
});

export const RECEIVE_PROJECT_DATASETS = "RECEIVE_PROJECT_DATASETS";
const receiveProjectDatasets = (projectID, datasets) => ({
    type: RECEIVE_PROJECT_DATASETS,
    projectID,
    datasets
});

export const HANDLE_PROJECT_DATASETS_ERROR = "HANDLE_PROJECT_DATASETS_ERROR";
const handleProjectDatasetsError = () => ({
    type: HANDLE_PROJECT_DATASETS_ERROR
});


export const BEGIN_PROJECT_CREATION = "BEGIN_PROJECT_CREATION";
const beginProjectCreation = () => ({
    type: BEGIN_PROJECT_CREATION
});

export const END_PROJECT_CREATION = "END_PROJECT_CREATION";
const endProjectCreation = project => ({
    type: END_PROJECT_CREATION,
    project
});

export const TERMINATE_PROJECT_CREATION = "TERMINATE_PROJECT_CREATION";
const terminateProjectCreation = () => ({
    type: TERMINATE_PROJECT_CREATION
});


export const BEGIN_PROJECT_DELETION = "BEGIN_PROJECT_DELETION";
const beginProjectDeletion = () => ({
    type: BEGIN_PROJECT_DELETION
});

export const END_PROJECT_DELETION = "END_PROJECT_DELETION";
const endProjectDeletion = projectID => ({
    type: END_PROJECT_DELETION,
    projectID
});

export const TERMINATE_PROJECT_DELETION = "TERMINATE_PROJECT_DELETION";
const terminateProjectDeletion = () => ({
    type: TERMINATE_PROJECT_DELETION
});


export const SELECT_PROJECT = "SELECT_PROJECT";
const selectProject = projectID => ({
    type: SELECT_PROJECT,
    projectID
});

export const selectProjectIfItExists = projectID => async (dispatch, getState) => {
    if (!getState().projects.itemsByID.hasOwnProperty(projectID)) return;
    await dispatch(selectProject(projectID));
};


export const TOGGLE_PROJECT_CREATION_MODAL = "TOGGLE_PROJECT_CREATION_MODAL";
export const toggleProjectCreationModal = () => ({
    type: TOGGLE_PROJECT_CREATION_MODAL
});

export const TOGGLE_PROJECT_DELETION_MODAL = "TOGGLE_PROJECT_DELETION_MODAL";
export const toggleProjectDeletionModal = () => ({
    type: TOGGLE_PROJECT_DELETION_MODAL
});

export const TOGGLE_PROJECT_DATASET_ADDITION_MODAL = "TOGGLE_PROJECT_DATASET_ADDITION_MODAL";
export const toggleProjectDatasetAdditionModal = () => ({
    type: TOGGLE_PROJECT_DATASET_ADDITION_MODAL
});

export const BEGIN_PROJECT_EDITING = "BEGIN_PROJECT_EDITING";
export const beginProjectEditing = () => ({
    type: BEGIN_PROJECT_EDITING
});

export const END_PROJECT_EDITING = "END_PROJECT_EDITING";
export const endProjectEditing = () => ({
    type: END_PROJECT_EDITING
});

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
export const requestDropBoxTree = () => ({
    type: REQUEST_DROP_BOX_TREE
});

export const RECEIVE_DROP_BOX_TREE = "RECEIVE_DROP_BOX_TREE";
export const receiveDropBoxTree = tree => ({
    type: RECEIVE_DROP_BOX_TREE,
    tree
});


export const REQUEST_RUNS = "REQUEST_RUNS";
export const requestRuns = () => ({
    type: REQUEST_RUNS
});

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
export const beginIngestionRunSubmission = () => ({
    type: BEGIN_INGESTION_RUN_SUBMISSION
});

export const END_INGESTION_RUN_SUBMISSION = "END_INGESTION_RUN_SUBMISSION";
export const endIngestionRunSubmission = () => ({
    type: END_INGESTION_RUN_SUBMISSION
});


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


export const submitIngestionWorkflowRun = (serviceID, datasetID, workflow, inputs) => async (dispatch, getState) => {
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
