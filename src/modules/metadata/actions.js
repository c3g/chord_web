import fetch from "cross-fetch";
import {message} from "antd";

import {
    ADDING_SERVICE_TABLE,
    DELETING_SERVICE_TABLE,
    endAddingServiceTable,
    endDeletingServiceTable
} from "../services/actions";
import {endProjectEditing} from "../manager/actions";

import {
    createNetworkActionTypes,
    createFlowActionTypes,
    networkAction,

    beginFlow,
    endFlow,
    terminateFlow,
} from "../../utils/actions";
import {objectWithoutProps} from "../../utils";


export const FETCH_PROJECTS = createNetworkActionTypes("FETCH_PROJECTS");
export const FETCH_PROJECT_TABLES = createNetworkActionTypes("FETCH_PROJECT_TABLES");
export const FETCHING_PROJECTS_WITH_TABLES = createFlowActionTypes("FETCHING_PROJECTS_WITH_TABLES");

export const CREATE_PROJECT = createNetworkActionTypes("CREATE_PROJECT");
export const DELETE_PROJECT = createNetworkActionTypes("DELETE_PROJECT");
export const SAVE_PROJECT = createNetworkActionTypes("SAVE_PROJECT");

export const ADD_PROJECT_DATASET = createNetworkActionTypes("ADD_PROJECT_DATASET");
export const SAVE_PROJECT_DATASET = createNetworkActionTypes("SAVE_PROJECT_DATASET");
export const DELETE_PROJECT_DATASET = createNetworkActionTypes("DELETE_PROJECT_DATASET");
export const ADD_DATASET_LINKED_FIELD_SET = createNetworkActionTypes("ADD_DATASET_LINKED_FIELD_SET");
export const DELETE_DATASET_LINKED_FIELD_SET = createNetworkActionTypes("DELETE_DATASET_LINKED_FIELD_SET");

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
    paginated: true,
    err: "Error fetching projects"
}));


export const fetchProjectTables = networkAction(projectsByID => (dispatch, getState) => ({
    types: FETCH_PROJECT_TABLES,
    params: {projectsByID},
    url: `${getState().services.metadataService.url}/api/table_ownership`,
    paginated: true,
    err: "Error fetching tables"
}));


// TODO: if needed fetching + invalidation
export const fetchProjectsWithDatasetsAndTables = () => async (dispatch, getState) => {
    const state = getState();
    if (state.projects.isFetching ||
        state.projects.isCreating ||
        state.projects.isDeleting ||
        state.projects.isSaving) return;

    await dispatch(beginFlow(FETCHING_PROJECTS_WITH_TABLES));
    await dispatch(fetchProjects());
    await dispatch(fetchProjectTables(getState().projects.itemsByID));
    await dispatch(endFlow(FETCHING_PROJECTS_WITH_TABLES));
};


const createProject = networkAction((project, history) => (dispatch, getState) => ({
    types: CREATE_PROJECT,
    url: `${getState().services.metadataService.url}/api/projects`,
    req: {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(project)
    },
    err: "Error creating project",
    onSuccess: async data => {
        if (history) history.push(`/data/manager/projects/${data.identifier}`);
        message.success(`Project '${data.title}' created!`)
    }
}));

export const createProjectIfPossible = (project, history) => async (dispatch, getState) => {
    // TODO: Need object response from POST (is this done??)
    if (getState().projects.isCreating) return;
    await dispatch(createProject(project, history));
};

export const deleteProject = networkAction(project => (dispatch, getState) => ({
    types: DELETE_PROJECT,
    params: {project},
    url: `${getState().services.metadataService.url}/api/projects/${project.identifier}`,
    req: {method: "DELETE"},
    err: `Error deleting project '${project.title}'`,  // TODO: More user-friendly, detailed error
    onSuccess: () => message.success(`Project '${project.title}' deleted!`)
}));

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
    onSuccess: async () => {
        await dispatch(endProjectEditing());
        message.success(`Project '${project.title}' saved!`);
    }
}));

export const saveProjectIfPossible = project => async (dispatch, getState) => {
    if (getState().projects.isDeleting || getState().projects.isSaving) return;
    await dispatch(saveProject(project));
};


export const addProjectDataset = networkAction((project, dataset, onSuccess = (() => {})) =>
    (dispatch, getState) => ({
        types: ADD_PROJECT_DATASET,
        url: `${getState().services.metadataService.url}/api/datasets`,
        req: {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({...dataset, project: project.identifier})
        },
        err: `Error adding dataset to project '${project.title}'`,  // TODO: More user-friendly error
        // TODO: END ACTION?
        onSuccess: async () => {
            await onSuccess();
            message.success(`Added dataset '${dataset.title}' to project ${project.title}!`)
        }
    }));

export const saveProjectDataset = networkAction((dataset, onSuccess = (() => {})) => (dispatch, getState) => ({
    types: SAVE_PROJECT_DATASET,
    url: `${getState().services.metadataService.url}/api/datasets/${dataset.identifier}`,
    req: {
        method: "PUT",  // TODO: PATCH
        headers: {"Content-Type": "application/json"},
        // Filter out read-only props
        body: JSON.stringify(objectWithoutProps(dataset, ["identifier", "created", "updated"]))
    },
    err: `Error saving dataset '${dataset.title}'`,
    onSuccess: async () => {
        await onSuccess();
        message.success(`Saved dataset '${dataset.title}'`);
    }
}));

export const deleteProjectDataset = networkAction((project, dataset) => (dispatch, getState) => ({
    types: DELETE_PROJECT_DATASET,
    params: {project, dataset},
    url: `${getState().services.metadataService.url}/api/datasets/${dataset.identifier}`,
    req: {method: "DELETE"},
    err: `Error deleting dataset '${dataset.title}'`
    // TODO: Do we need to delete project tables as well? What to do here??
}));

export const deleteProjectDatasetIfPossible = (project, dataset) => async (dispatch, getState) => {
    if (getState().projects.isAddingDataset
        || getState().projects.isSavingDataset
        || getState().projects.isDeletingDataset) return;
    await dispatch(deleteProjectDataset(project, dataset));
};


const addDatasetLinkedFieldSet = networkAction((dataset, linkedFieldSet) => (dispatch, getState) => ({
    types: ADD_DATASET_LINKED_FIELD_SET,
    url: `${getState().services.metadataService.url}/api/datasets/${dataset.identifier}`,
    req: {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({linked_field_sets: [...dataset.linked_field_sets, linkedFieldSet]})
    },
    err: `Error adding linked field set '${linkedFieldSet.name}' to dataset '${dataset.title}'`,
    onSuccess: () =>
        message.success(`Added linked field set '${linkedFieldSet.name}' to dataset '${dataset.title}'`)
}));

export const addDatasetLinkedFieldSetIfPossible = (dataset, linkedFieldSet) => async (dispatch, getState) => {
    if (getState().projects.isAddingDataset || getState().projects.isSavingDataset) return;  // TODO: isDeleting
    await dispatch(addDatasetLinkedFieldSet(dataset, linkedFieldSet));
};


const deleteDatasetLinkedFieldSet = networkAction((dataset, linkedFieldSet, linkedFieldSetIndex) =>
    (dispatch, getState) => ({
        types: DELETE_DATASET_LINKED_FIELD_SET,
        url: `${getState().services.metadataService.url}/api/datasets/${dataset.identifier}`,
        req: {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                linked_field_sets: dataset.linked_field_sets.filter((_, i) => i !== linkedFieldSetIndex)
            })
        },
        err: `Error deleting linked field set '${linkedFieldSet.name}' from dataset '${dataset.title}'`,
        onSuccess: () =>
            message.success(`Deleted linked field set '${linkedFieldSet.name}' from dataset '${dataset.title}'`)
    }));

export const deleteDatasetLinkedFieldSetIfPossible = (dataset, linkedFieldSet, linkedFieldSetIndex) =>
    async (dispatch, getState) => {
        if (getState().projects.isAddingDataset
            || getState().projects.isSavingDataset
            || getState().projects.isDeletingDataset) return;
        await dispatch(deleteDatasetLinkedFieldSet(dataset, linkedFieldSet, linkedFieldSetIndex));
    };


// TODO: Split into network actions, use onSuccess
export const addProjectTable = (project, datasetID, serviceInfo, dataType, tableName) =>
    async (dispatch, getState) => {
        if (getState().projectTables.isAdding) return;  // TODO: or isDeleting

        await dispatch(beginFlow(PROJECT_TABLE_ADDITION));
        await dispatch(beginFlow(ADDING_SERVICE_TABLE));

        const terminate = async () => {
            message.error(`Error adding new table '${tableName}'`);
            await dispatch(terminateFlow(ADDING_SERVICE_TABLE));
            await dispatch(terminateFlow(PROJECT_TABLE_ADDITION));
        };

        await fetch(`${serviceInfo.url}/tables?data-type=${dataType}`, {method: "OPTIONS"});

        try {
            const serviceResponse = await fetch(`${serviceInfo.url}/tables?data-type=${dataType}`, {
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


// TODO: Split into network actions, use onSuccess
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
        const serviceResponse = await fetch(`${serviceInfo.url}/tables/${table.table_id}`, {method: "DELETE"});
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
    const chordServiceInfo = getState().chordServices.itemsByArtifact[
        getState().services.itemsByID[table.service_id].type.split(":")[1]];
    if (chordServiceInfo.manageable_tables === false) {
        // If manageable_tables is set and not true, we can't delete the table.
        return;
    }
    await dispatch(deleteProjectTable(project, table));
};


export const fetchPhenopackets = networkAction(() => (dispatch, getState) => ({
    types: FETCH_PHENOPACKETS,
    url: `${getState().services.metadataService.url}/api/phenopackets`,
    paginated: true,
    err: "Error fetching phenopackets"
}));

export const fetchPhenopacketsIfNeeded = () => async (dispatch, getState) => {
    if (getState().phenopackets.isFetching || getState().phenopackets.items.length > 0) return;
    dispatch(fetchPhenopackets());
};

export const fetchBiosamples = networkAction(() => (dispatch, getState) => ({
    types: FETCH_BIOSAMPLES,
    url: `${getState().services.metadataService.url}/api/biosamples`,
    paginated: true,
    err: "Error fetching biosamples"
}));

export const fetchBiosamplesIfNeeded = () => async (dispatch, getState) => {
    if (getState().biosamples.isFetching || getState().biosamples.items.length > 0) return;
    dispatch(fetchBiosamples());
};

export const fetchIndividuals = networkAction(() => (dispatch, getState) => ({
    types: FETCH_INDIVIDUALS,
    url: `${getState().services.metadataService.url}/api/individuals`,
    paginated: true,
    err: "Error fetching individuals",
}));

export const fetchIndividualsIfNeeded = () => async (dispatch, getState) => {
    if (getState().individuals.isFetching || getState().individuals.items.length > 0) return;
    dispatch(fetchIndividuals());
};
