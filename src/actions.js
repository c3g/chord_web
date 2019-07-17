import fetch from "cross-fetch";

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

export const REQUEST_SERVICE_DATASETS = "REQUEST_SERVICE_DATASETS";
const requestServiceDatasets = id => ({type: REQUEST_SERVICE_DATASETS, service: id});

export const RECEIVE_SERVICE_DATASETS = "RECEIVE_SERVICE_DATASETS";
const receiveServiceDatasets = (id, data) => ({
    type: RECEIVE_SERVICE_DATASETS,
    service: id,
    datasets: data,
    receivedAt: Date.now()
});

export const fetchServicesWithMetadataAndDatasets = () => {
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
       getState().services.items.forEach((s, i) => {
           serviceMetadata[s.id] = responses[i].ok ? responseData[i] : false;
       });

       await dispatch(receiveServiceMetadata(serviceMetadata));


       // Fetch Data Service Datasets (for searching)

       for (let s of getState().services.items) {
           if (!s.metadata["chordDataService"]) continue;
           await dispatch(requestServiceDatasets(s.id));
           try {
               const response = await fetch(`/api${s.url}/datasets`);
               if (response.ok) {
                   const data = await response.json();
                   await dispatch(receiveServiceDatasets(s.id, data));
               } else {
                   console.error(response)
               }
           } catch (e) {
               console.error(e);
           }
       }
   };
};

export const REQUEST_SEARCH = "REQUEST_SEARCH";
const requestSearch = (serviceID, datasetID) => ({
    type: REQUEST_SEARCH,
    serviceID,
    datasetID
});

export const RECEIVE_SEARCH = "RECEIVE_SEARCH";
const receiveSearch = (serviceID, datasetID, results) => ({
    type: RECEIVE_SEARCH,
    serviceID,
    datasetID,
    results,
    receivedAt: Date.now()
});

export const performSearch = (serviceID, datasetID, conditions) => {
    return async (dispatch, getState) => {
        // TODO: ONLY FETCH PREVIOUS STUFF IF NEEDED
        await dispatch(fetchServicesWithMetadataAndDatasets());

        // Perform search
        // TODO: VALIDATE THAT THE SERVICE HAS A SEARCH ENDPOINT

        await dispatch(requestSearch(serviceID, datasetID));
        const serviceSearchURL = `/api${getState().services.itemsByID[serviceID].url}/search`;

        const response = await fetch(serviceSearchURL, {
            method: "POST",
            headers: {"Content-Type": "application/json"}, // TODO: Real GA4GH headers
            body: JSON.stringify(conditions)
        });

        if (response.ok) {
            const data = await response.json();
            return dispatch(receiveSearch(serviceID, datasetID, data));
        } else {
            console.error(response);
        }
    };
};
