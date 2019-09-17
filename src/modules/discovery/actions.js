import {fetchServicesWithMetadataAndDataTypesAndDatasetsIfNeeded} from "../services/actions";

import {basicAction, createNetworkActionTypes, networkAction} from "../../utils"

export const TOGGLE_DISCOVERY_SCHEMA_MODAL = "TOGGLE_DISCOVERY_SCHEMA_MODAL";

export const FETCH_SEARCH = createNetworkActionTypes("FETCH_SEARCH");
export const SELECT_SEARCH = "SELECT_SEARCH";

export const SELECT_DISCOVERY_SERVICE_DATA_TYPE = "SELECT_DISCOVERY_SERVICE_DATA_TYPE";
export const CLEAR_DISCOVERY_SERVICE_DATA_TYPE = "CLEAR_DISCOVERY_SERVICE_DATA_TYPE";
export const UPDATE_DISCOVERY_SEARCH_FORM = "UPDATE_DISCOVERY_SEARCH_FORM";


export const toggleDiscoverySchemaModal = basicAction(TOGGLE_DISCOVERY_SCHEMA_MODAL);

export const selectSearch = (serviceID, dataTypeID, searchIndex) => ({
    type: SELECT_SEARCH,
    serviceID,
    dataTypeID,
    searchIndex
});


// noinspection JSUnusedGlobalSymbols
export const fetchSearch = networkAction((service, dataTypeID, conditions) => ({
    types: FETCH_SEARCH,
    params: {serviceID: service.id, dataTypeID},
    url: `/api/federation/search-aggregate${service.url}/search`,
    req: {
        method: "POST",
        headers: {"Content-Type": "application/json"},  // TODO: Real GA4GH headers
        body: JSON.stringify({dataTypeID, conditions: [...conditions]})
    },
    err: "Search returned an error",  // TODO: Better search errors
    afterAction: () => async (dispatch, getState) =>
        await dispatch(selectSearch(service.id, dataTypeID,
            getState().discovery.searchesByServiceAndDataTypeID[service.id][dataTypeID].length - 1))
}));


// TODO: VALIDATE THAT THE SERVICE HAS A SEARCH ENDPOINT
export const performSearch = (service, dataTypeID, conditions) => async dispatch => {
    await dispatch(fetchServicesWithMetadataAndDataTypesAndDatasetsIfNeeded());
    await dispatch(fetchSearch(service, dataTypeID, conditions));
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
