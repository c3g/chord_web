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
import {fetchRuns, fetchAllRunDetailsIfNeeded} from "../wes/actions";

export const FETCH_USER = createNetworkActionTypes("FETCH_USER");

export const fetchUser = networkAction(() => ({
    types: FETCH_USER,
    url: "/api/user"
}));

export const fetchUserAndDependentData = servicesCb => async (dispatch, getState) => {
    const oldState = getState().auth.user;
    await dispatch(fetchUser());
    await dispatch(fetchServicesWithMetadataAndDataTypesAndTablesIfNeeded());
    await (servicesCb || (() => {}))();

    if (getState().auth.user === null || oldState !== null) return;
    // Otherwise, we're newly authenticated, so run all actions that need authentication.
    // TODO: CHECK OWNERSHIP

    await Promise.all([
        dispatch(fetchProjectsWithDatasetsAndTables()),  // TODO: If needed
        dispatch(fetchDropBoxTree()),
        (async () => {
            await dispatch(fetchRuns());
            await dispatch(fetchAllRunDetailsIfNeeded());
        })(),
        dispatch(fetchPhenopacketsIfNeeded()),
        dispatch(fetchBiosamplesIfNeeded()),
        dispatch(fetchIndividualsIfNeeded()),
        dispatch(fetchNotifications()),
    ]);
};
