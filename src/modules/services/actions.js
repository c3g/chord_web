import fetch from "cross-fetch";
import {message} from "antd";

import {basicAction, createNetworkActionTypes} from "../../utils";

export const BEGIN_LOADING_ALL_SERVICE_DATA = "BEGIN_LOADING_ALL_SERVICE_DATA";
export const END_LOADING_ALL_SERVICE_DATA = "END_LOADING_ALL_SERVICE_DATA";

export const FETCH_SERVICES = createNetworkActionTypes("FETCH_SERVICES");

export const REQUEST_SERVICE_METADATA = "REQUEST_SERVICE_METADATA";
export const RECEIVE_SERVICE_METADATA = "RECEIVE_SERVICE_METADATA";

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

const requestServices = basicAction(FETCH_SERVICES.REQUEST);
const receiveServices = data => ({type: FETCH_SERVICES.RECEIVE, services: data, receivedAt: Date.now()});
const handleServicesError = basicAction(FETCH_SERVICES.ERROR);

const requestServiceMetadata = () => ({type: REQUEST_SERVICE_METADATA});
const receiveServiceMetadata = metadata => ({type: RECEIVE_SERVICE_METADATA, metadata, receivedAt: Date.now()});

const requestServiceDataTypes = serviceID => ({type: FETCH_SERVICE_DATA_TYPES.REQUEST, serviceID});
const receiveServiceDataTypes = (serviceID, dataTypes) => ({
    type: FETCH_SERVICE_DATA_TYPES.RECEIVE,
    serviceID,
    dataTypes,
    receivedAt: Date.now()
});
const handleServiceDataTypesError = serviceID => ({type: FETCH_SERVICE_DATA_TYPES.ERROR, serviceID});

const requestServiceDatasets = (serviceID, dataTypeID) => ({
    type: FETCH_SERVICE_DATASETS.RECEIVE,
    serviceID,
    dataTypeID
});
const receiveServiceDatasets = (serviceID, dataTypeID, datasets) => ({
    type: FETCH_SERVICE_DATASETS.RECEIVE,
    serviceID,
    dataTypeID,
    datasets,
    receivedAt: Date.now()
});
const handleServiceDatasetsError = (serviceID, dataTypeID) => ({
    type: FETCH_SERVICE_DATASETS.ERROR,
    serviceID,
    dataTypeID
});


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

const requestServiceWorkflows = serviceID => ({type: FETCH_SERVICE_WORKFLOWS.REQUEST, serviceID});
const receiveServiceWorkflows = (serviceID, workflows) => ({
    type: FETCH_SERVICE_WORKFLOWS.RECEIVE,
    serviceID,
    workflows
});
const handleServiceWorkflowsError = serviceID => ({type: FETCH_SERVICE_WORKFLOWS.ERROR, serviceID});


export const fetchServices = () => async dispatch => {
    await dispatch(requestServices());
    try {
        const response = await fetch("/api/service_registry/services");

        if (response.ok) {
            const data = await response.json();
            await dispatch(receiveServices(data));
        } else {
            message.error("Error fetching services");
            console.error(response);
            await dispatch(handleServicesError());
        }
    } catch (e) {
        message.error("Error fetching services");
        console.error(e);
        await dispatch(handleServicesError());
    }
};


export const fetchServiceMetadata = () => async (dispatch, getState) => {
    // TODO: This request/receive format doesn't make sense; there are multiple requests being made

    await dispatch(requestServiceMetadata());

    const responses = await Promise.all(getState().services.items.map(service => (async () => {
        try {
            const r = await fetch(`/api${service.url}/service-info`);
            return r.ok ? (await r.json()) : false;
        } catch (e) {
            console.error(e);
            return null;  // Invalid or no response from service
        }
    })()));

    const serviceMetadata = Object.fromEntries(getState().services.items.map((s, i) => [s.id, responses[i]]));

    await dispatch(receiveServiceMetadata(serviceMetadata));
};


export const fetchDataServiceDataTypes = service => async dispatch => {
    await dispatch(requestServiceDataTypes(service.id));
    try {
        const response = await fetch(`/api${service.url}/data-types`);

        if (response.ok) {
            const data = await response.json();
            await dispatch(receiveServiceDataTypes(service.id, data));
        } else {
            console.error(response);
            message.error(`Error fetching data types from service '${service.name}'`);
            await dispatch(handleServiceDataTypesError(service.id));
        }
    } catch (e) {
        console.error(e);
        message.error(e);
        await dispatch(handleServiceDataTypesError(service.id));
    }
};


export const fetchDataServiceDataTypeDatasets = (service, dataType) => async dispatch => {
    await dispatch(requestServiceDatasets(service.id, dataType.id));
    try {
        const params = new URLSearchParams();
        params.set("data-type", dataType.id);

        const response = await fetch(`/api${service.url}/datasets?${params.toString()}`);

        if (response.ok) {
            const data = await response.json();
            await dispatch(receiveServiceDatasets(service.id, dataType.id, data));
        } else {
            console.error(response);
            message.error(`Error fetching datasets from service '${service.name}' (data type ${dataType.id})`);
            await dispatch(handleServiceDatasetsError(service.id, dataType.id));
        }
    } catch (e) {
        console.error(e);
        message.error(e);
        await dispatch(handleServiceDatasetsError(service.id, dataType.id));
    }
};


export const fetchDataServiceWorkflows = service => async dispatch => {
    await dispatch(requestServiceWorkflows(service.id));
    try {
        const response = await fetch(`/api${service.url}/workflows`);

        if (response.ok) {
            const workflows = await response.json();
            await dispatch(receiveServiceWorkflows(service.id, workflows));
        } else {
            // Don't error; service may not have any workflows - TODO: yet another action?
            await dispatch(handleServiceWorkflowsError(service.id));
        }
    } catch (e) {
        console.error(e);
        message.error(e);
        await dispatch(handleServiceWorkflowsError(service.id));
    }
};


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
    await dispatch(fetchServiceMetadata());

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
