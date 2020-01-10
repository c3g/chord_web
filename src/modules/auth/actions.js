import {createNetworkActionTypes, networkAction} from "../../utils/actions";

import {fetchDropBoxTree} from "../manager/actions";
import {
    fetchProjectsWithDatasetsAndTables,

    fetchBiosamplesIfNeeded,
    fetchIndividualsIfNeeded,
    fetchPhenopacketsIfNeeded
} from "../metadata/actions";
import {fetchNotifications} from "../notifications/actions";
import {fetchServicesWithMetadataAndDataTypesAndTablesIfNeeded} from "../services/actions";
import {fetchRuns} from "../wes/actions";

export const FETCH_USER = createNetworkActionTypes("FETCH_USER");

export const fetchUser = networkAction(() => ({
    types: FETCH_USER,
    url: "/api/auth/user"
}));

export const fetchUserAndDependentData = servicesCb => async (dispatch, getState) => {
    const oldState = getState().auth.user;
    await dispatch(fetchUser());
    await dispatch(fetchServicesWithMetadataAndDataTypesAndTablesIfNeeded());
    await (servicesCb || (() => {}))();

    const newState = getState().auth.user;
    if (newState === null || (oldState || {}).chord_user_role === newState.chord_user_role) return;
    if (newState.chord_user_role !== "owner") return;

    // Otherwise, we're newly authenticated as an owner, so run all actions that need authentication.
    await Promise.all([
        dispatch(fetchProjectsWithDatasetsAndTables()),  // TODO: If needed
        dispatch(fetchDropBoxTree()),
        dispatch(fetchRuns()),
        dispatch(fetchPhenopacketsIfNeeded()),
        dispatch(fetchBiosamplesIfNeeded()),
        dispatch(fetchIndividualsIfNeeded()),
        dispatch(fetchNotifications()),
    ]);
};
