import {basicAction, createNetworkActionTypes, networkAction} from "../../utils";

export const BEGIN_LOADING_ALL_SERVICE_DATA = "BEGIN_LOADING_ALL_SERVICE_DATA";
export const END_LOADING_ALL_SERVICE_DATA = "END_LOADING_ALL_SERVICE_DATA";

export const FETCH_SERVICES = createNetworkActionTypes("FETCH_SERVICES");
export const FETCH_SERVICE_METADATA = createNetworkActionTypes("FETCH_SERVICE_METADATA");
export const FETCH_SERVICE_DATA_TYPES = createNetworkActionTypes("FETCH_SERVICE_DATA_TYPES");
export const FETCH_SERVICE_DATASETS = createNetworkActionTypes("FETCH_SERVICE_DATASETS");

export const BEGIN_ADDING_SERVICE_DATASET = "BEGIN_ADDING_SERVICE_DATASET";
export const END_ADDING_SERVICE_DATASET = "END_ADDING_SERVICE_DATASET";
export const TERMINATE_ADDING_SERVICE_DATASET = "TERMINATE_ADDING_SERVICE_DATASET";

export const BEGIN_FETCHING_SERVICE_WORKFLOWS = "BEGIN_FETCHING_SERVICE_WORKFLOWS";
export const END_FETCHING_SERVICE_WORKFLOWS = "END_FETCHING_SERVICE_WORKFLOWS";

export const FETCH_SERVICE_WORKFLOWS = createNetworkActionTypes("FETCH_SERVICE_WORKFLOWS");


const beginLoadingAllServiceData = basicAction(BEGIN_LOADING_ALL_SERVICE_DATA);
const endLoadingAllServiceData = basicAction(END_LOADING_ALL_SERVICE_DATA);

export const beginAddingServiceDataset = basicAction(BEGIN_ADDING_SERVICE_DATASET);
export const endAddingServiceDataset = (serviceID, dataTypeID, dataset) => ({
    type: END_ADDING_SERVICE_DATASET,
    serviceID,
    dataTypeID,
    dataset
});
export const terminateAddingServiceDataset = basicAction(TERMINATE_ADDING_SERVICE_DATASET);

const beginFetchingServiceWorkflows = basicAction(BEGIN_FETCHING_SERVICE_WORKFLOWS);
const endFetchingServiceWorkflows = basicAction(END_FETCHING_SERVICE_WORKFLOWS);


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

export const fetchDataServiceDataTypeDatasets = networkAction((service, dataType) => {
    const params = new URLSearchParams();
    params.set("data-type", dataType.id);
    return {
        types: FETCH_SERVICE_DATASETS,
        params: {serviceID: service.id, dataTypeID: dataType.id},
        url: `/api${service.url}/datasets?${params.toString()}`,
        err: `Error fetching datasets from service '${service.name}' (data type ${dataType.id})`
    };
});

export const fetchDataServiceWorkflows = networkAction(service => ({
    types: FETCH_SERVICE_WORKFLOWS,
    params: {serviceID: service.id},
    url: `/api${service.url}/workflows`
}));


export const fetchServicesWithMetadataAndDataTypesAndDatasets = () => async (dispatch, getState) => {
    if (getState().services.isFetchingAll) return;

    await dispatch(beginLoadingAllServiceData());

    // Fetch Services
    await dispatch(fetchServices());
    if (!getState().services.items) {
        // Something went wrong, terminate early
        await dispatch(endLoadingAllServiceData());
        return;
    }

    // Fetch Service Metadata
    await Promise.all(getState().services.items.map(s => dispatch(fetchServiceMetadata(s))));

    // Fetch other data (need metadata first):

    // - Skip services that don't provide data (i.e. no data types/workflows/etc.)
    const dataServices = getState().services.items.filter(s => (s.metadata || {})["chordDataService"]);

    // - Fetch Data Service Data Types
    await Promise.all(dataServices.map(s => dispatch(fetchDataServiceDataTypes(s))));

    // - Fetch dependent data
    await Promise.all([
        // Fetch Data Service Local Datasets
        // - skip services that don't provide data or don't have data types
        ...dataServices.flatMap(s =>
            ((getState().serviceDataTypes.dataTypesByServiceID[s.id] || {items: []}).items || [])
                .map(dt => dispatch(fetchDataServiceDataTypeDatasets(s, dt)))),

        // Fetch Data Service Workflows=
        (async () => {
            await dispatch(beginFetchingServiceWorkflows());
            await Promise.all(dataServices.map(s => dispatch(fetchDataServiceWorkflows(s))));
            await dispatch(endFetchingServiceWorkflows());
        })()
    ]);

    await dispatch(endLoadingAllServiceData());
};

export const fetchServicesWithMetadataAndDataTypesAndDatasetsIfNeeded = () => {
    return async (dispatch, getState) => {
        const state = getState();
        if ((state.services.items.length === 0 ||
                Object.keys(state.serviceMetadata.metadata).length === 0 ||
                Object.keys(state.serviceDataTypes.dataTypesByServiceID).length === 0) &&
                !state.services.isFetchingAll) {
            await fetchServicesWithMetadataAndDataTypesAndDatasets();
        }
    }
};
