import fetch from "cross-fetch";
import {message} from "antd";

export const REQUEST_SERVICES = "REQUEST_SERVICES";
const requestServices = () => ({type: REQUEST_SERVICES});

export const RECEIVE_SERVICES = "RECEIVE_SERVICES";
const receiveServices = data => ({
    type: RECEIVE_SERVICES,
    services: data,
    receivedAt: Date.now()
});

export const fetchServices = () => async dispatch => {
    await dispatch(requestServices());
    const response = await fetch("/api/service_registry/services");
    const data = await response.json();
    return dispatch(receiveServices(data));
};

export const REQUEST_SERVICE_METADATA = "REQUEST_SERVICE_METADATA";
const requestServiceMetadata = () => ({type: REQUEST_SERVICE_METADATA});

export const RECEIVE_SERVICE_METADATA = "RECEIVE_SERVICE_METADATA";
const receiveServiceMetadata = data => ({
    type: RECEIVE_SERVICE_METADATA,
    metadata: data,
    receivedAt: Date.now()
});

export const REQUEST_SERVICE_DATA_TYPES = "REQUEST_SERVICE_DATA_TYPES";
const requestServiceDataTypes = id => ({type: REQUEST_SERVICE_DATA_TYPES, service: id});

export const RECEIVE_SERVICE_DATA_TYPES = "RECEIVE_SERVICE_DATA_TYPES";
const receiveServiceDataTypes = (id, data) => ({
    type: RECEIVE_SERVICE_DATA_TYPES,
    service: id,
    dataTypes: data,
    receivedAt: Date.now()
});

export const fetchServicesWithMetadataAndDataTypes = () => {
   return async (dispatch, getState) => {
       // Fetch Services

       await dispatch(fetchServices());
       await dispatch(requestServiceMetadata());


       // Fetch Service Metadata

       const serviceInfoURLs = getState().services.items.map(service => `/api${service.url}/service-info`);

       let responses = [];

       for (let u of serviceInfoURLs) {
           try {
               responses.push(await fetch(u));
           } catch (e) {
               console.error(e);
               responses.push(null); // Invalid or no response from service
           }
       }

       let responseData = [];
       for (let r of responses) {
           try {
               responseData.push(await r.json());
           } catch (e) {
               console.error(e);
               responseData.push(null); // Invalid or no response from service
           }
       }

       let serviceMetadata = {};
       getState().services.items.forEach((s, i) =>
           serviceMetadata[s.id] = responses[i].ok ? responseData[i] : false);

       await dispatch(receiveServiceMetadata(serviceMetadata));


       // Fetch Data Service Data Types (for searching)

       for (let s of getState().services.items) {
           if (!s.metadata["chordDataService"]) continue;  // Skip services that don't provide data
           await dispatch(requestServiceDataTypes(s.id));  // Fetch available data types from all data providers
           try {
               const response = await fetch(`/api${s.url}/data-types`);
               if (response.ok) {
                   const data = await response.json();
                   await dispatch(receiveServiceDataTypes(s.id, data));
               } else {
                   console.error(response);
                   message.error(`Error fetching data types from service '${s.name}'`)
               }
           } catch (e) {
               console.error(e);
               message.error(e);
           }
       }
   };
};

const fetchServicesWithMetadataAndDataTypesIfNeeded = () => {
    return async (dispatch, getState) => {
        const state = getState();
        if ((state.services.items.length === 0 ||
             Object.keys(state.serviceMetadata.metadata).length === 0 ||
             Object.keys(state.serviceDataTypes.dataTypes).length === 0) &&
            !(state.services.isFetching || state.serviceMetadata.isFetching || state.serviceDataTypes.isFetching)) {
            await fetchServicesWithMetadataAndDataTypes();
        }
    }
};

export const REQUEST_SEARCH = "REQUEST_SEARCH";
const requestSearch = (serviceID, dataTypeID) => ({
    type: REQUEST_SEARCH,
    serviceID,
    dataTypeID
});

export const RECEIVE_SEARCH = "RECEIVE_SEARCH";
const receiveSearch = (serviceID, dataTypeID, results) => ({
    type: RECEIVE_SEARCH,
    serviceID,
    dataTypeID,
    results,
    receivedAt: Date.now()
});

export const SELECT_SEARCH = "SELECT_SEARCH";
export const selectSearch = (serviceID, dataTypeID, searchIndex) => ({
    type: SELECT_SEARCH,
    serviceID,
    dataTypeID,
    searchIndex
});

export const HANDLE_SEARCH_ERROR = "HANDLE_SEARCH_ERROR";
export const handleSearchError = err => {
    message.error(err);
    return {type: HANDLE_SEARCH_ERROR};
};

export const performSearch = (serviceID, dataTypeID, conditions) => {
    return async (dispatch, getState) => {
        // TODO: ONLY FETCH PREVIOUS STUFF IF NEEDED
        await dispatch(fetchServicesWithMetadataAndDataTypesIfNeeded());

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
};

export const SELECT_DISCOVERY_SERVICE_DATA_TYPE = "SELECT_DISCOVERY_SERVICE_DATA_TYPE";
export const selectDiscoveryServiceDataType = (serviceID, dataTypeID) => ({
    type: SELECT_DISCOVERY_SERVICE_DATA_TYPE,
    serviceID,
    dataTypeID
});

export const CLEAR_DISCOVERY_SERVICE_DATA_TYPE = "CLEAR_DISCOVERY_SERVICE_DATA_TYPE";
export const clearDiscoveryServiceDataType = () => ({
    type: CLEAR_DISCOVERY_SERVICE_DATA_TYPE
});

export const UPDATE_DISCOVERY_SEARCH_FORM = "UPDATE_DISCOVERY_SEARCH_FORM";
export const updateDiscoverySearchForm = (serviceID, dataTypeID, fields) => ({
    type: UPDATE_DISCOVERY_SEARCH_FORM,
    serviceID,
    dataTypeID,
    fields
});
