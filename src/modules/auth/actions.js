import {
    beginFlow,
    createFlowActionTypes,
    createNetworkActionTypes,
    endFlow,
    networkAction
} from "../../utils/actions";

import {fetchDropBoxTree} from "../manager/actions";
import {
    fetchProjectsWithDatasetsAndTables,
} from "../metadata/actions";
import {fetchNodeInfo} from "../node/actions";
import {fetchNotifications} from "../notifications/actions";
import {fetchServicesWithMetadataAndDataTypesAndTablesIfNeeded} from "../services/actions";
import {fetchRuns} from "../wes/actions";
import {nop} from "../../utils/misc";
import {withBasePath} from "../../utils/url";

export const FETCH_USER = createNetworkActionTypes("FETCH_USER");
export const FETCHING_USER_DEPENDENT_DATA = createFlowActionTypes("FETCHING_USER_DEPENDENT_DATA");

export const fetchUser = networkAction(() => ({
    types: FETCH_USER,
    url: withBasePath("api/auth/user")
}));

// TODO: Rename this (also fetches node info)
export const fetchUserAndDependentData = servicesCb => async (dispatch, getState) => {
    const oldState = getState().auth.user;
    const hasAttempted = getState().auth.hasAttempted;

    if (!hasAttempted) {
        dispatch(beginFlow(FETCHING_USER_DEPENDENT_DATA));

        // Fetch node info if it's the first time this has been run; node info doesn't really change.
        await dispatch(fetchNodeInfo());
    }

    await dispatch(fetchUser());

    if (!hasAttempted) {
        await dispatch(fetchServicesWithMetadataAndDataTypesAndTablesIfNeeded());
        await (servicesCb || nop)();
        await dispatch(fetchProjectsWithDatasetsAndTables());  // TODO: If needed, remove if !hasAttempted
    }

    const newState = getState().auth.user;
    if (newState === null
            || (oldState || {}).chord_user_role === newState.chord_user_role
            || newState.chord_user_role !== "owner") {
        if (!hasAttempted) dispatch(endFlow(FETCHING_USER_DEPENDENT_DATA));
        return;
    }

    // Otherwise, we're newly authenticated as an owner, so run all actions that need authentication.
    await Promise.all([
        ...(getState().services.dropBoxService ? [dispatch(fetchDropBoxTree())] : []),
        dispatch(fetchRuns()),
        dispatch(fetchNotifications()),
    ]);

    if (!hasAttempted) dispatch(endFlow(FETCHING_USER_DEPENDENT_DATA));
};
