import fetch from "cross-fetch";

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


// TODO: if needed fetching + invalidation
export const fetchProjects = () => async (dispatch, getState) => {
    if (getState().projects.isFetching || getState().projects.isCreating || getState().projects.isDeleting) return;

    await dispatch(requestProjects());

    try {
        const response = await fetch("/api/project/projects");
        if (response.ok) {
            const data = await response.json();
            await dispatch(receiveProjects(data));
        } else {
            // TODO: GUI error message
            console.error(response);
            await dispatch(handleProjectsError());
        }
    } catch (e) {
        // TODO: GUI error message
        console.error(e);
        await dispatch(handleProjectsError());
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
