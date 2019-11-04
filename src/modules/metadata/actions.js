import fetch from "cross-fetch";
import {message} from "antd";

import {
    ADDING_SERVICE_TABLE,
    DELETING_SERVICE_TABLE,
    endAddingServiceTable,
    endDeletingServiceTable
} from "../services/actions";
import {endProjectEditing, selectProjectIfItExists} from "../manager/actions";

import {
    createNetworkActionTypes,
    createFlowActionTypes,
    networkAction,

    beginFlow,
    terminateFlow,
} from "../../utils/actions";

import {createFormData} from "../../utils/requests";


export const FETCH_PROJECTS = createNetworkActionTypes("FETCH_PROJECTS");

export const FETCH_PROJECT_DATASETS = createNetworkActionTypes("FETCH_PROJECT_DATASETS");

export const FETCHING_PROJECT_TABLES = createFlowActionTypes("FETCHING_PROJECT_TABLES");
export const FETCH_PROJECT_TABLES = createNetworkActionTypes("FETCH_PROJECT_TABLES");

export const CREATE_PROJECT = createNetworkActionTypes("CREATE_PROJECT");
export const DELETE_PROJECT = createNetworkActionTypes("DELETE_PROJECT");
export const SAVE_PROJECT = createNetworkActionTypes("SAVE_PROJECT");

export const ADD_PROJECT_DATASET = createNetworkActionTypes("ADD_PROJECT_DATASET");

export const PROJECT_TABLE_ADDITION = createFlowActionTypes("PROJECT_TABLE_ADDITION");
export const PROJECT_TABLE_DELETION = createFlowActionTypes("PROJECT_TABLE_DELETION");

export const FETCH_PHENOPACKETS = createNetworkActionTypes("FETCH_PHENOPACKETS");


const endProjectTableAddition = (projectID, table) => ({type: PROJECT_TABLE_ADDITION.END, projectID, table});
const endProjectTableDeletion = (projectID, tableID) => ({type: PROJECT_TABLE_DELETION.END, projectID, tableID});


export const fetchProjects = networkAction(() => ({
    types: FETCH_PROJECTS,
    url: "/api/metadata/api/projects",
    err: "Error fetching projects"
}));


export const fetchProjectDatasets = networkAction(() => ({
    types: FETCH_PROJECT_DATASETS,
    url: "/api/metadata/api/datasets",
    err: "Error fetching tables"
}));

export const fetchProjectTables = networkAction(projectDatasets => ({
    types: FETCH_PROJECT_TABLES,
    params: {projectDatasets},
    url: "/api/metadata/api/table_ownership",
    err: "Error fetching tables"
}));


// TODO: if needed fetching + invalidation
export const fetchProjectsWithDatasetsAndTables = () => async (dispatch, getState) => {
    const state = getState();
    if (state.projects.isFetching ||
        state.projects.isCreating ||
        state.projects.isDeleting ||
        state.projects.isSaving) return;

    await dispatch(fetchProjects());
    await dispatch(fetchProjectDatasets());
    await dispatch(fetchProjectTables(getState().projectDatasets.itemsByProjectID));
};


const createProject = networkAction(project => ({
    types: CREATE_PROJECT,
    url: "/api/metadata/api/projects",
    req: {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(project)
    },
    err: "Error creating project",
    afterAction: data => async dispatch => await dispatch(selectProjectIfItExists(data.id)),
    onSuccess: data => message.success(`Project '${data.name}' created!`)
}));

export const createProjectIfPossible = project => async (dispatch, getState) => {
    // TODO: Need object response from POST (is this done??)
    if (getState().projects.isCreating) return;
    await dispatch(createProject(project));
};

export const deleteProject = networkAction(projectID => ({
    types: DELETE_PROJECT,
    params: {projectID},
    url: `/api/metadata/api/projects/${projectID}`,
    req: {method: "DELETE"},
    err: `Error deleting project '${projectID}'`,  // TODO: More user-friendly error
    onSuccess: () => message.success("Project deleted!")  // TODO: More user-friendly error
}));  // TODO: Fix project selection afterwards

export const deleteProjectIfPossible = projectID => async (dispatch, getState) => {
    if (getState().projects.isDeleting) return;
    await dispatch(deleteProject(projectID));

    // TODO: Do we need to delete project tables as well? What to do here??
};


const saveProject = networkAction(project => ({
    types: SAVE_PROJECT,
    params: {projectID: project.project_id},
    url: `/api/metadata/api/projects/${project.project_id}`,
    req: {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(project)
    },
    err: `Error saving project '${project.name}'`,  // TODO: More user-friendly error
    afterAction: () => async dispatch => dispatch(endProjectEditing()),
    onSuccess: () => message.success(`Project '${project.name}' saved!`)
}));

export const saveProjectIfPossible = project => async (dispatch, getState) => {
    if (getState().projects.isDeleting) return;
    if (getState().projects.isSaving) return;
    await dispatch(saveProject(project));
};


export const addProjectDataset = networkAction((project, name, description) => ({
    types: ADD_PROJECT_DATASET,
    params: {projectID: project.project_id},
    url: `/api/metadata/api/datasets`,
    req: {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            name,
            description,
            project: project.project_id
        })
    },
    err: `Error adding dataset to project '${project.name}'`,  // TODO: More user-friendly error
    // TODO: END ACTION?
    onSuccess: () => message.success(`Added dataset '${name}' to project ${project.name}!`)
}));


export const addProjectTable = (projectID, datasetID, serviceID, dataType, tableName) => async (dispatch, getState) => {
    if (getState().projectTables.isAdding) return;

    await dispatch(beginFlow(PROJECT_TABLE_ADDITION));
    await dispatch(beginFlow(ADDING_SERVICE_TABLE));

    const terminate = async () => {
        message.error(`Error adding new table '${tableName}'`);
        await dispatch(terminateFlow(ADDING_SERVICE_TABLE));
        await dispatch(terminateFlow(PROJECT_TABLE_ADDITION));
    };

    try {
        const serviceResponse = await fetch(
            `/api/${getState().services.itemsByID[serviceID].name}/datasets?data-type=${dataType}`,
            {method: "POST", body: createFormData({name: tableName.trim(), metadata: JSON.stringify({})})});

        if (!serviceResponse.ok) {
            console.error(serviceResponse);
            await terminate();
            return;
        }

        const serviceTable = await serviceResponse.json();

        // TODO: Rename dataset, add actual dataset adding endpoint
        try {
            const projectResponse = await fetch(`/api/metadata/api/table_ownership`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    table_id: serviceTable.id,
                    service_id: serviceID,
                    data_type: dataType,

                    dataset: datasetID,
                    sample: null  // TODO: Sample ID if wanted
                })
            });

            if (!projectResponse.ok) {
                // TODO: Delete previously-created service dataset
                console.error(projectResponse);
                await terminate();
                return;
            }

            const projectTable = await projectResponse.json();
            message.success("Table added!");  // TODO: Nicer GUI success message
            await dispatch(endAddingServiceTable(serviceID, dataType, serviceTable));
            await dispatch(endProjectTableAddition(projectID, projectTable));  // TODO: Check params here
        } catch (e) {
            // TODO: Delete previously-created service dataset
            console.error(e);
            await terminate();
        }
    } catch (e) {
        console.error(e);
        await terminate();
    }
};


const deleteProjectTable = (projectID, table) => async (dispatch, getState) => {
    await dispatch(beginFlow(PROJECT_TABLE_DELETION));
    await dispatch(beginFlow(DELETING_SERVICE_TABLE));

    const terminate = async () => {
        message.error(`Error deleting table '${table.name}'`);
        await dispatch(terminateFlow(DELETING_SERVICE_TABLE));
        await dispatch(terminateFlow(PROJECT_TABLE_DELETION));
    };

    // Delete from service
    try {
        // TODO: Dataset --> Table

        const serviceResponse = await fetch(
            `/api/${getState().services.itemsByID[table.service_id].name}/datasets/${table.table_id}`,
            {method: "DELETE"});

        if (!serviceResponse.ok) {
            console.error(serviceResponse);
            await terminate();
            return;
        }
    } catch (e) {
        console.error(e);
        await terminate();
        return;
    }

    // Delete from project metadata
    try {
        const projectResponse = await fetch(`/api/metadata/api/table_ownership/${table.table_id}`,
            {method: "DELETE"});

        if (!projectResponse.ok) {
            // TODO: Handle partial failure / out-of-sync
            console.error(projectResponse);
            await terminate();
            return;
        }
    } catch (e) {
        // TODO: Handle partial failure / out-of-sync
        console.error(e);
        await terminate();
    }

    // Success

    message.success("Table deleted!");  // TODO: Nicer GUI success message

    await dispatch(endDeletingServiceTable(table.service_id, table.table_id));  // TODO: Check params here
    await dispatch(endProjectTableDeletion(projectID, table.table_id));  // TODO: Check params here
};

export const deleteProjectTableIfPossible = (projectID, table) => async (dispatch, getState) => {
    if (getState().projectTables.isDeleting) return;
    await dispatch(deleteProjectTable(projectID, table));
};


export const fetchPhenopackets = networkAction(() => ({
    types: FETCH_PHENOPACKETS,
    url: `/api/metadata/api/phenopackets`,
    err: "Error fetching phenopackets"
}));
