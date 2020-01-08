import {message} from "antd";

import {createNetworkActionTypes, networkAction} from "../../utils/actions";

export const FETCH_PEERS = createNetworkActionTypes("FETCH_PEERS");
const fetchPeers = networkAction(() => (dispatch, getState) => ({
    types: FETCH_PEERS,
    url: `${getState().services.federationService.url}/peers`,
    err: "Error fetching peers"
}));

export const fetchPeersOrError = () => async dispatch => {
    try {
        await dispatch(fetchPeers());
    } catch (e) {
        // Possibly federationService is null
        message.error("Error fetching peers");
        console.error(e);
    }
};
