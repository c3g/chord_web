import {message} from "antd";
import fetch from "cross-fetch";

import {fetchServicesWithMetadataAndDataTypesAndDatasetsIfNeeded} from "../services/actions";

import {basicAction, createNetworkActionTypes} from "../../utils"

export const TOGGLE_DISCOVERY_SCHEMA_MODAL = "TOGGLE_DISCOVERY_SCHEMA_MODAL";

export const FETCH_SEARCH = createNetworkActionTypes("FETCH_SEARCH");
export const SELECT_SEARCH = "SELECT_SEARCH";

export const SELECT_DISCOVERY_SERVICE_DATA_TYPE = "SELECT_DISCOVERY_SERVICE_DATA_TYPE";
export const CLEAR_DISCOVERY_SERVICE_DATA_TYPE = "CLEAR_DISCOVERY_SERVICE_DATA_TYPE";
export const UPDATE_DISCOVERY_SEARCH_FORM = "UPDATE_DISCOVERY_SEARCH_FORM";


export const toggleDiscoverySchemaModal = basicAction(TOGGLE_DISCOVERY_SCHEMA_MODAL);


const requestSearch = (serviceID, dataTypeID) => ({
    type: FETCH_SEARCH.REQUEST,
    serviceID,
    dataTypeID
});

const receiveSearch = (serviceID, dataTypeID, results) => ({
    type: FETCH_SEARCH.RECEIVE,
    serviceID,
    dataTypeID,
    results,
    receivedAt: Date.now()
});

export const handleSearchError = err => {
    message.error(err);
    return {type: FETCH_SEARCH.ERROR};
};

export const selectSearch = (serviceID, dataTypeID, searchIndex) => ({
    type: SELECT_SEARCH,
    serviceID,
    dataTypeID,
    searchIndex
});


export const performSearch = (serviceID, dataTypeID, conditions) => async (dispatch, getState) => {
    // TODO: ONLY FETCH PREVIOUS STUFF IF NEEDED
    await dispatch(fetchServicesWithMetadataAndDataTypesAndDatasetsIfNeeded());

    // Perform search
    // TODO: VALIDATE THAT THE SERVICE HAS A SEARCH ENDPOINT

    await dispatch(requestSearch(serviceID, dataTypeID));
    const serviceSearchURL =
        `/api/federation/search-aggregate${getState().services.itemsByID[serviceID].url}/search`;

    const response = await fetch(serviceSearchURL, {
        method: "POST",
        headers: {"Content-Type": "application/json"}, // TODO: Real GA4GH headers
        body: JSON.stringify({
            dataTypeID: getState().discovery.selectedDataTypeID,
            conditions: [...conditions]
        })
    });

    if (response.ok) {
        const data = await response.json();
        await dispatch(receiveSearch(serviceID, dataTypeID, data));
        await dispatch(selectSearch(serviceID, dataTypeID, getState().discovery
            .searchesByServiceAndDataTypeID[serviceID][dataTypeID].length - 1));
    } else {
        console.error(response);
        // TODO: Better search errors
        await dispatch(handleSearchError("Search returned an error"));
    }
};

export const selectDiscoveryServiceDataType = (serviceID, dataTypeID) => ({
    type: SELECT_DISCOVERY_SERVICE_DATA_TYPE,
    serviceID,
    dataTypeID
});

export const clearDiscoveryServiceDataType = basicAction(CLEAR_DISCOVERY_SERVICE_DATA_TYPE);

export const updateDiscoverySearchForm = (serviceID, dataTypeID, fields) => ({
    type: UPDATE_DISCOVERY_SEARCH_FORM,
    serviceID,
    dataTypeID,
    fields
});
