import {createNetworkActionTypes, networkAction} from "../../utils/actions";

export const FETCH_PEERS = createNetworkActionTypes("FETCH_PEERS");
export const fetchPeers = networkAction(() => ({
    types: FETCH_PEERS,
    url: "/api/federation/peers",
    err: "Error fetching peers"
}));
