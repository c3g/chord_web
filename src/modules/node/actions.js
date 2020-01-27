import {createNetworkActionTypes, networkAction} from "../../utils/actions";

export const FETCH_NODE_INFO = createNetworkActionTypes("FETCH_NODE_INFO");

export const fetchNodeInfo = networkAction(() => ({
    types: FETCH_NODE_INFO,
    url: "/api/node-info",
    err: "Error fetching information about current node",
}));
