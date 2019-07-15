import fetch from "cross-fetch";

export const REQUEST_SERVICES = "REQUEST_SERVICES";
const requestServices = () => ({type: REQUEST_SERVICES});

export const RECEIVE_SERVICES = "RECEIVE_SERVICES";
const receiveServices = data => ({
    type: RECEIVE_SERVICES,
    services: data,
    receivedAt: Date.now()
});

export const INVALIDATE_SERVICES = "INVALIDATE_SERVICES";
export const invalidateServices = () => ({
    type: INVALIDATE_SERVICES
});

export const fetchServices = () => {
    return async dispatch => {
        await dispatch(requestServices());
        const response = await fetch("/api/service_registry/services");
        const data = await response.json();
        return dispatch(receiveServices(data));
    };
};

export const REQUEST_SERVICE_METADATA = "REQUEST_SERVICE_METADATA";
const requestServiceMetadata = () => ({type: REQUEST_SERVICE_METADATA});

export const RECEIVE_SERVICE_METADATA = "RECEIVE_SERVICE_METADATA";
const receiveServiceMetadata = data => ({
    type: RECEIVE_SERVICE_METADATA,
    metadata: data,
    receivedAt: Date.now()
});

export const INVALIDATE_SERVICE_METADATA = "INVALIDATE_SERVICE_METADATA";
export const invalidateServiceMetadata = () => ({
    type: INVALIDATE_SERVICE_METADATA
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

export const INVALIDATE_SERVICE_DATASETS = "INVALIDATE_SERVICE_DATASETS";
export const invalidateServiceDatasets = () => ({
    type: INVALIDATE_SERVICE_DATASETS
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
   }
};
