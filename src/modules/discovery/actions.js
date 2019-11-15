import {basicAction, createNetworkActionTypes, networkAction} from "../../utils/actions"


export const TOGGLE_DISCOVERY_SCHEMA_MODAL = "TOGGLE_DISCOVERY_SCHEMA_MODAL";

export const FETCH_SEARCH = createNetworkActionTypes("FETCH_SEARCH");
export const SELECT_SEARCH = "SELECT_SEARCH";

export const SELECT_DISCOVERY_SERVICE_DATA_TYPE = "SELECT_DISCOVERY_SERVICE_DATA_TYPE";
export const CLEAR_DISCOVERY_SERVICE_DATA_TYPE = "CLEAR_DISCOVERY_SERVICE_DATA_TYPE";
export const UPDATE_DISCOVERY_SEARCH_FORM = "UPDATE_DISCOVERY_SEARCH_FORM";


export const toggleDiscoverySchemaModal = basicAction(TOGGLE_DISCOVERY_SCHEMA_MODAL);

export const selectSearch = (serviceInfo, dataTypeID, searchIndex) => ({
    type: SELECT_SEARCH,
    serviceInfo,
    dataTypeID,
    searchIndex
});


export const fetchSearch = networkAction((serviceInfo, dataTypeID, conditions, query) => (dispatch, getState) => ({
    types: FETCH_SEARCH,
    params: {serviceID: serviceInfo.id, dataTypeID},
    url: `${getState().services.federationService.url}/search-aggregate${serviceInfo.url}/search`,
    req: {
        method: "POST",
        headers: {"Content-Type": "application/json"},  // TODO: Real GA4GH headers
        body: JSON.stringify({
            // OLD FORMAT
            dataTypeID,
            conditions,

            // NEW FORMAT
            data_type: dataTypeID,
            query
        })
    },
    err: "Search returned an error",  // TODO: Better search errors
    afterAction: () => async (dispatch, getState) =>
        await dispatch(selectSearch(serviceInfo.id, dataTypeID,
            getState().discovery.searchesByServiceAndDataTypeID[serviceInfo.id][dataTypeID].length - 1))
}));


// TODO: VALIDATE THAT THE SERVICE HAS A SEARCH ENDPOINT
export const performSearch = (serviceInfo, dataTypeID, conditions) => async dispatch => {
    // Compile conditions into new search format
    const query = conditions.map(c => {
        let exp = [`#${c.operation}`, ["#resolve", ...c.field.split(".").slice(1)], c.searchValue];
        if (c.negated) exp = ["#not", exp];
        return exp;
    }).reduce((se, v) => ["#and", se, v]);

    await dispatch(fetchSearch(serviceInfo, dataTypeID, conditions, query));
};

export const selectDiscoveryServiceDataType = (serviceInfo, dataTypeID) => ({
    type: SELECT_DISCOVERY_SERVICE_DATA_TYPE,
    serviceInfo,
    dataTypeID
});

export const clearDiscoveryServiceDataType = basicAction(CLEAR_DISCOVERY_SERVICE_DATA_TYPE);

export const updateDiscoverySearchForm = (serviceInfo, dataTypeID, fields) => ({
    type: UPDATE_DISCOVERY_SEARCH_FORM,
    serviceInfo,
    dataTypeID,
    fields
});
