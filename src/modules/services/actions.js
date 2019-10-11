import {
    createNetworkActionTypes,
    createFlowActionTypes,
    networkAction,

    beginFlow,
    endFlow,
    terminateFlow
} from "../../utils/actions";

import {createURLSearchParams} from "../../utils/requests";


export const LOADING_ALL_SERVICE_DATA = createFlowActionTypes("LOADING_ALL_SERVICE_DATA");

export const FETCH_SERVICES = createNetworkActionTypes("FETCH_SERVICES");

export const FETCH_SERVICE_METADATA = createNetworkActionTypes("FETCH_SERVICE_METADATA");
export const LOADING_SERVICE_METADATA = createFlowActionTypes("LOADING_SERVICE_METADATA");

export const FETCH_SERVICE_DATA_TYPES = createNetworkActionTypes("FETCH_SERVICE_DATA_TYPES");
export const LOADING_SERVICE_DATA_TYPES = createFlowActionTypes("LOADING_SERVICE_DATA_TYPES");

export const FETCH_SERVICE_TABLES = createNetworkActionTypes("FETCH_SERVICE_TABLES");
export const LOADING_SERVICE_TABLES = createFlowActionTypes("LOADING_SERVICE_TABLES");

export const ADDING_SERVICE_TABLE = createFlowActionTypes("ADDING_SERVICE_TABLE");

export const FETCH_SERVICE_WORKFLOWS = createNetworkActionTypes("FETCH_SERVICE_WORKFLOWS");
export const LOADING_SERVICE_WORKFLOWS = createFlowActionTypes("LOADING_SERVICE_WORKFLOWS");


export const endAddingServiceTable = (serviceID, dataTypeID, dataset) => ({
    type: ADDING_SERVICE_TABLE.END,
    serviceID,
    dataTypeID,
    dataset
});


export const fetchServices = networkAction(() => ({
    types: FETCH_SERVICES,
    url: "/api/service_registry/services",
    err: "Error fetching services"
}));

export const fetchServiceMetadata = networkAction(service => ({
    types: FETCH_SERVICE_METADATA,
    params: {serviceID: service.id},
    url: `/api${service.url}/service-info`,
    err: `Error contacting service '${service.name}'`
}));

export const fetchDataServiceDataTypes = networkAction(service => ({
    types: FETCH_SERVICE_DATA_TYPES,
    params: {serviceID: service.id},
    url: `/api${service.url}/data-types`,
    err: `Error fetching data types from service '${service.name}'`
}));

export const fetchDataServiceDataTypeTables = networkAction((service, dataType) => ({
    types: FETCH_SERVICE_TABLES,
    params: {serviceID: service.id, dataTypeID: dataType.id},
    url: `/api${service.url}/datasets?${createURLSearchParams({"data-type": dataType.id}).toString()}`,
    err: `Error fetching tables from service '${service.name}' (data type ${dataType.id})`
}));

export const fetchDataServiceWorkflows = networkAction(service => ({
    types: FETCH_SERVICE_WORKFLOWS,
    params: {serviceID: service.id},
    url: `/api${service.url}/workflows`
}));


export const fetchServicesWithMetadataAndDataTypesAndTables = () => async (dispatch, getState) => {
    if (getState().services.isFetchingAll) return;

    await dispatch(beginFlow(LOADING_ALL_SERVICE_DATA));

    // Fetch Services
    await dispatch(fetchServices());
    if (!getState().services.items) {
        // Something went wrong, terminate early
        await dispatch(terminateFlow(LOADING_ALL_SERVICE_DATA));
        return;
    }

    // Fetch Service Metadata
    await dispatch(beginFlow(LOADING_SERVICE_METADATA));
    await Promise.all(getState().services.items.map(s => dispatch(fetchServiceMetadata(s))));
    await dispatch(endFlow(LOADING_SERVICE_METADATA));

    // Fetch other data (need metadata first):

    // - Skip services that don't provide data (i.e. no data types/workflows/etc.)
    const dataServices = getState().services.items.filter(s => (s.metadata || {})["chordDataService"]);

    // - Fetch Data Service Data Types and Workflows
    await Promise.all([
        (async () => {
            await dispatch(beginFlow(LOADING_SERVICE_DATA_TYPES));
            await Promise.all(dataServices.map(s => dispatch(fetchDataServiceDataTypes(s))));
            await dispatch(endFlow(LOADING_SERVICE_DATA_TYPES));
        })(),
        (async () => {
            await dispatch(beginFlow(LOADING_SERVICE_WORKFLOWS));
            await Promise.all(dataServices.map(s => dispatch(fetchDataServiceWorkflows(s))));
            await dispatch(endFlow(LOADING_SERVICE_WORKFLOWS));
        })()
    ]);

    // Fetch Data Service Local Tables
    // - skip services that don't provide data or don't have data types
    await dispatch(beginFlow(LOADING_SERVICE_TABLES));
    await Promise.all(dataServices.flatMap(s =>
        ((getState().serviceDataTypes.dataTypesByServiceID[s.id] || {items: []}).items || [])
            .map(dt => dispatch(fetchDataServiceDataTypeTables(s, dt)))));
    await dispatch(endFlow(LOADING_SERVICE_TABLES));

    await dispatch(endFlow(LOADING_ALL_SERVICE_DATA));
};

export const fetchServicesWithMetadataAndDataTypesAndDatasetsIfNeeded = () => async (dispatch, getState) => {
    const state = getState();
    if ((state.services.items.length === 0 ||
            Object.keys(state.serviceMetadata.metadata).length === 0 ||
            Object.keys(state.serviceDataTypes.dataTypesByServiceID).length === 0) &&
            !state.services.isFetchingAll) {
        await fetchServicesWithMetadataAndDataTypesAndTables();
    }
};
