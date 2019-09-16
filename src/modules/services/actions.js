import fetch from "cross-fetch";
import {message} from "antd";

import {basicAction} from "../../utils";

export const BEGIN_LOADING_ALL_SERVICE_DATA = "BEGIN_LOADING_ALL_SERVICE_DATA";
const beginLoadingAllServiceData = basicAction(BEGIN_LOADING_ALL_SERVICE_DATA);

export const END_LOADING_ALL_SERVICE_DATA = "END_LOADING_ALL_SERVICE_DATA";
const endLoadingAllServiceData = basicAction(END_LOADING_ALL_SERVICE_DATA);

export const REQUEST_SERVICES = "REQUEST_SERVICES";
const requestServices = basicAction(REQUEST_SERVICES);

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
const receiveServiceMetadata = metadata => ({
    type: RECEIVE_SERVICE_METADATA,
    metadata,
    receivedAt: Date.now()
});

export const REQUEST_SERVICE_DATA_TYPES = "REQUEST_SERVICE_DATA_TYPES";
const requestServiceDataTypes = serviceID => ({
    type: REQUEST_SERVICE_DATA_TYPES,
    serviceID
});

export const RECEIVE_SERVICE_DATA_TYPES = "RECEIVE_SERVICE_DATA_TYPES";
const receiveServiceDataTypes = (serviceID, dataTypes) => ({
    type: RECEIVE_SERVICE_DATA_TYPES,
    serviceID,
    dataTypes,
    receivedAt: Date.now()
});

export const REQUEST_SERVICE_DATASETS = "REQUEST_SERVICE_DATASETS";
const requestServiceDatasets = (serviceID, dataTypeID) => ({
    type: REQUEST_SERVICE_DATASETS,
    serviceID,
    dataTypeID
});

export const RECEIVE_SERVICE_DATASETS = "RECEIVE_SERVICE_DATASETS";
const receiveServiceDatasets = (serviceID, dataTypeID, datasets) => ({
    type: RECEIVE_SERVICE_DATASETS,
    serviceID,
    dataTypeID,
    datasets,
    receivedAt: Date.now()
});


export const BEGIN_ADDING_SERVICE_DATASET = "BEGIN_ADDING_SERVICE_DATASET";
export const beginAddingServiceDataset = basicAction(BEGIN_ADDING_SERVICE_DATASET);

export const END_ADDING_SERVICE_DATASET = "END_ADDING_SERVICE_DATASET";
export const endAddingServiceDataset = (serviceID, dataTypeID, dataset) => ({
    type: END_ADDING_SERVICE_DATASET,
    serviceID,
    dataTypeID,
    dataset
});

export const TERMINATE_ADDING_SERVICE_DATASET = "TERMINATE_ADDING_SERVICE_DATASET";
export const terminateAddingServiceDataset = basicAction(TERMINATE_ADDING_SERVICE_DATASET);


export const BEGIN_FETCHING_SERVICE_WORKFLOWS = "BEGIN_FETCHING_SERVICE_WORKFLOWS";
const beginFetchingServiceWorkflows = basicAction(BEGIN_FETCHING_SERVICE_WORKFLOWS);

export const END_FETCHING_SERVICE_WORKFLOWS = "END_FETCHING_SERVICE_WORKFLOWS";
const endFetchingServiceWorkflows = basicAction(END_FETCHING_SERVICE_WORKFLOWS);

export const REQUEST_SERVICE_WORKFLOWS = "REQUEST_SERVICE_WORKFLOWS";
const requestServiceWorkflows = serviceID => ({
    type: REQUEST_SERVICE_WORKFLOWS,
    serviceID
});

export const RECEIVE_SERVICE_WORKFLOWS = "RECEIVE_SERVICE_WORKFLOWS";
const receiveServiceWorkflows = (serviceID, workflows) => ({
    type: RECEIVE_SERVICE_WORKFLOWS,
    serviceID,
    workflows
});


export const fetchServicesWithMetadataAndDataTypesAndDatasets = () => {
    return async (dispatch, getState) => {
        // Fetch Services

        if (getState().services.isFetchingAll) return;

        await dispatch(beginLoadingAllServiceData());

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


        // Fetch Data Service Local Datasets

        for (let s of getState().services.items) {
            if (!s.metadata["chordDataService"]) continue;  // Skip services that don't provide data
            const dataTypes = getState().serviceDataTypes.dataTypes[s.id];
            if (dataTypes === undefined) continue;  // Error fetching data types in previous step
            for (let dt of getState().serviceDataTypes.dataTypes[s.id]) {
                await dispatch(requestServiceDatasets(s.id, dt.id));
                try {
                    const params = new URLSearchParams();
                    params.set("data-type", dt.id);

                    const response = await fetch(`/api${s.url}/datasets?${params.toString()}`);

                    if (response.ok) {
                        const data = await response.json();
                        await dispatch(receiveServiceDatasets(s.id, dt.id, data));
                    } else {
                        console.error(response);
                        message.error(`Error fetching datasets from service '${s.name}' (data type ${dt.id})`);
                    }
                } catch (e) {
                    console.error(e);
                    message.error(e);
                }
            }
        }


        // Fetch Data Service Workflows

        await dispatch(beginFetchingServiceWorkflows());

        for (let s of getState().services.items) {
            if (!s.metadata["chordDataService"]) continue;  // Skip services that don't provide data (i.e. no workflows)
            await dispatch(requestServiceWorkflows(s.id));
            try {
                const response = await fetch(`/api${s.url}/workflows`);
                if (response.ok) {
                    const workflows = await response.json();
                    await dispatch(receiveServiceWorkflows(s.id, workflows));
                } else {
                    // TODO: Separate action instead of "fake" receive?
                    await dispatch(receiveServiceWorkflows(s.id, {ingestion: {}, analysis: {}}));
                }
            } catch (e) {
                console.error(e);
                message.error(e);
            }
        }

        await dispatch(endFetchingServiceWorkflows());


        await dispatch(endLoadingAllServiceData());
    };
};

export const fetchServicesWithMetadataAndDataTypesAndDatasetsIfNeeded = () => {
    return async (dispatch, getState) => {
        const state = getState();
        if ((state.services.items.length === 0 ||
                Object.keys(state.serviceMetadata.metadata).length === 0 ||
                Object.keys(state.serviceDataTypes.dataTypes).length === 0) &&
                !state.services.isFetchingAll) {
            await fetchServicesWithMetadataAndDataTypesAndDatasets();
        }
    }
};
