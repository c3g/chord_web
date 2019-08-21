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

export const TOGGLE_PROJECT_CREATION_MODAL = "TOGGLE_PROJECT_CREATION_MODAL";
export const toggleProjectCreationModal = () => ({
    type: TOGGLE_PROJECT_CREATION_MODAL
});

// TODO: if needed fetching + invalidation
export const fetchProjects = () => async (dispatch, getState) => {
    if (getState().projects.isFetching) return;

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
            body: {...project}
        });

        if (response.ok) {
            // Created
            const data = await response.json();
            await dispatch(endProjectCreation(data));
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
