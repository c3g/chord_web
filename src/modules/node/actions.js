import {createNetworkActionTypes, networkAction} from "../../utils/actions";
import {withBasePath} from "../../utils/url";

export const FETCH_NODE_INFO = createNetworkActionTypes("FETCH_NODE_INFO");

export const fetchNodeInfo = networkAction(() => ({
    types: FETCH_NODE_INFO,
    url: withBasePath("api/node-info"),
    err: "Error fetching information about current node",
}));
