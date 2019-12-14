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


export const FETCH_PROJECTS = createNetworkActionTypes("FETCH_PROJECTS");
export const FETCH_PROJECT_TABLES = createNetworkActionTypes("FETCH_PROJECT_TABLES");

export const CREATE_PROJECT = createNetworkActionTypes("CREATE_PROJECT");
export const DELETE_PROJECT = createNetworkActionTypes("DELETE_PROJECT");
export const SAVE_PROJECT = createNetworkActionTypes("SAVE_PROJECT");

export const ADD_PROJECT_DATASET = createNetworkActionTypes("ADD_PROJECT_DATASET");

export const PROJECT_TABLE_ADDITION = createFlowActionTypes("PROJECT_TABLE_ADDITION");
export const PROJECT_TABLE_DELETION = createFlowActionTypes("PROJECT_TABLE_DELETION");

export const FETCH_PHENOPACKETS = createNetworkActionTypes("FETCH_PHENOPACKETS");
export const FETCH_BIOSAMPLES = createNetworkActionTypes("FETCH_BIOSAMPLES");
export const FETCH_INDIVIDUALS = createNetworkActionTypes("FETCH_INDIVIDUALS");


const endProjectTableAddition = (project, table) => ({type: PROJECT_TABLE_ADDITION.END, project, table});
const endProjectTableDeletion = (project, tableID) => ({type: PROJECT_TABLE_DELETION.END, project, tableID});


export const fetchProjects = networkAction(() => (dispatch, getState) => ({
    types: FETCH_PROJECTS,
    url: `${getState().services.metadataService.url}/api/projects`,
    err: "Error fetching projects"
}));


export const fetchProjectTables = networkAction(projectsByID => (dispatch, getState) => ({
    types: FETCH_PROJECT_TABLES,
    params: {projectsByID},
    url: `${getState().services.metadataService.url}/api/table_ownership`,
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
    await dispatch(fetchProjectTables(getState().projects.itemsByID));
};


const createProject = networkAction(project => (dispatch, getState) => ({
    types: CREATE_PROJECT,
    url: `${getState().services.metadataService.url}/api/projects`,
    req: {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(project)
    },
    err: "Error creating project",
    afterAction: data => async dispatch => await dispatch(selectProjectIfItExists(data.id)),
    onSuccess: data => message.success(`Project '${data.title}' created!`)
}));

export const createProjectIfPossible = project => async (dispatch, getState) => {
    // TODO: Need object response from POST (is this done??)
    if (getState().projects.isCreating) return;
    await dispatch(createProject(project));
};

export const deleteProject = networkAction(project => (dispatch, getState) => ({
    types: DELETE_PROJECT,
    params: {project},
    url: `${getState().services.metadataService.url}/api/projects/${project.identifier}`,
    req: {method: "DELETE"},
    err: `Error deleting project '${project.title}'`,  // TODO: More user-friendly error
    onSuccess: () => message.success("Project deleted!")  // TODO: More user-friendly error
}));  // TODO: Fix project selection afterwards

export const deleteProjectIfPossible = project => async (dispatch, getState) => {
    if (getState().projects.isDeleting) return;
    await dispatch(deleteProject(project));

    // TODO: Do we need to delete project tables as well? What to do here??
};


const saveProject = networkAction(project => (dispatch, getState) => ({
    types: SAVE_PROJECT,
    url: `${getState().services.metadataService.url}/api/projects/${project.identifier}`,
    req: {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(project)
    },
    err: `Error saving project '${project.title}'`,  // TODO: More user-friendly error
    afterAction: () => async dispatch => dispatch(endProjectEditing()),
    onSuccess: () => message.success(`Project '${project.title}' saved!`)
}));

export const saveProjectIfPossible = project => async (dispatch, getState) => {
    if (getState().projects.isDeleting) return;
    if (getState().projects.isSaving) return;
    await dispatch(saveProject(project));
};


export const addProjectDataset = networkAction((project, dataset) => (dispatch, getState) => ({
    types: ADD_PROJECT_DATASET,
    url: `${getState().services.metadataService.url}/api/datasets`,
    req: {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({...dataset, project: project.identifier})
    },
    err: `Error adding dataset to project '${project.title}'`,  // TODO: More user-friendly error
    // TODO: END ACTION?
    onSuccess: () => message.success(`Added dataset '${title}' to project ${project.title}!`)
}));


export const addProjectTable = (project, datasetID, serviceInfo, dataType, tableName) =>
    async (dispatch, getState) => {
        if (getState().projectTables.isAdding) return;

        await dispatch(beginFlow(PROJECT_TABLE_ADDITION));
        await dispatch(beginFlow(ADDING_SERVICE_TABLE));

        const terminate = async () => {
            message.error(`Error adding new table '${tableName}'`);
            await dispatch(terminateFlow(ADDING_SERVICE_TABLE));
            await dispatch(terminateFlow(PROJECT_TABLE_ADDITION));
        };

        await fetch(`${serviceInfo.url}/datasets?data-type=${dataType}`, {method: "OPTIONS"});

        try {
            const serviceResponse = await fetch(`${serviceInfo.url}/datasets?data-type=${dataType}`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    name: tableName.trim(),
                    metadata: {}
                })
            });

            if (!serviceResponse.ok) {
                console.error(serviceResponse);
                await terminate();
                return;
            }

            const serviceTable = await serviceResponse.json();

            // TODO: Rename dataset, add actual dataset adding endpoint
            try {
                const projectResponse = await fetch(
                    `${getState().services.metadataService.url}/api/table_ownership`,
                    {
                        method: "POST",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({
                            table_id: serviceTable.id,
                            service_id: serviceInfo.id,
                            service_artifact: serviceInfo.type.split(":")[1],
                            data_type: dataType,

                            dataset: datasetID,
                            sample: null  // TODO: Sample ID if wanted
                        })
                    }
                );

                if (!projectResponse.ok) {
                    // TODO: Delete previously-created service dataset
                    console.error(projectResponse);
                    await terminate();
                    return;
                }

                const projectTable = await projectResponse.json();
                message.success("Table added!");  // TODO: Nicer GUI success message
                await dispatch(endAddingServiceTable(serviceInfo, dataType, serviceTable));
                await dispatch(endProjectTableAddition(project, projectTable));  // TODO: Check params here
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


const deleteProjectTable = (project, table) => async (dispatch, getState) => {
    await dispatch(beginFlow(PROJECT_TABLE_DELETION));
    await dispatch(beginFlow(DELETING_SERVICE_TABLE));

    const serviceInfo = getState().services.itemsByID[table.service_id];

    const terminate = async () => {
        message.error(`Error deleting table '${table.name}'`);
        await dispatch(terminateFlow(DELETING_SERVICE_TABLE));
        await dispatch(terminateFlow(PROJECT_TABLE_DELETION));
    };

    // Delete from service
    try {
        // TODO: Dataset --> Table
        const serviceResponse = await fetch(`${serviceInfo.url}/datasets/${table.table_id}`, {method: "DELETE"});
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
        const projectResponse = await fetch(
            `${getState().services.metadataService.url}/api/table_ownership/${table.table_id}`,
            {method: "DELETE"}
        );

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

    await dispatch(endDeletingServiceTable(serviceInfo.id, table.table_id));  // TODO: Check params here
    await dispatch(endProjectTableDeletion(project, table.table_id));  // TODO: Check params here
};

export const deleteProjectTableIfPossible = (project, table) => async (dispatch, getState) => {
    if (getState().projectTables.isDeleting) return;
    await dispatch(deleteProjectTable(project, table));
};


export const fetchPhenopackets = networkAction(() => (dispatch, getState) => ({
    types: FETCH_PHENOPACKETS,
    url: `${getState().services.metadataService.url}/api/phenopackets`,
    err: "Error fetching phenopackets"
}));

export const fetchPhenopacketsIfNeeded = () => async (dispatch, getState) => {
    if (getState().phenopackets.isFetching || getState().phenopackets.items.length > 0) return;
    dispatch(fetchPhenopackets());
};

export const fetchBiosamples = networkAction(() => (dispatch, getState) => ({
    types: FETCH_BIOSAMPLES,
    url: `${getState().services.metadataService.url}/api/biosamples`,
    err: "Error fetching biosamples"
}));

export const fetchBiosamplesIfNeeded = () => async (dispatch, getState) => {
    if (getState().biosamples.isFetching || getState().biosamples.items.length > 0) return;
    dispatch(fetchBiosamples());
};

export const fetchIndividuals = networkAction(() => (dispatch, getState) => ({
    types: FETCH_INDIVIDUALS,
    url: `${getState().services.metadataService.url}/api/individuals`,
    err: "Error fetching individuals"
}));

export const fetchIndividualsIfNeeded = () => async (dispatch, getState) => {
    if (getState().individuals.isFetching || getState().individuals.items.length > 0) return;
    dispatch(fetchIndividuals());
};
