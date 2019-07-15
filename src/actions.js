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

export const fetchServicesWithMetadata = () => {
   return async (dispatch, getState) => {
       await dispatch(fetchServices());
       await dispatch(requestServiceMetadata());
       const serviceInfoURLs = getState().services.items.map(service => `/api${service.url}/service-info`);
       const responses = await Promise.all(serviceInfoURLs.map(u => fetch(u)));
       const responseData = await Promise.all(responses.map(r => r.json()));

       let serviceMetadata = {};
       getState().services.items.forEach((s, i) => {
           serviceMetadata[s.id] = responses[i].ok ? responseData[i] : false;
       });

       return dispatch(receiveServiceMetadata(serviceMetadata));
   }
};
