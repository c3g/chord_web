import {createNetworkActionTypes, networkAction} from "../../utils/actions";

export const FETCH_PEERS = createNetworkActionTypes("FETCH_PEERS");
export const fetchPeers = networkAction(() => (dispatch, getState) => ({
    types: FETCH_PEERS,
    url: `${getState().services.federationService.url}/peers`,
    err: "Error fetching peers"
}));
