import {createNetworkActionTypes, networkAction} from "../../utils/actions";

export const FETCH_USER = createNetworkActionTypes("FETCH_USER");

export const fetchUser = networkAction(() => (dispatch, getState) => ({
    types: FETCH_USER,
    url: "/api/user"
}));
