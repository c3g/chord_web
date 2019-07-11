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
            // .then(response => response.json(), error => console.log(error))
            // .then(data => dispatch(receiveServices(data)));
    };
};

export const REQUEST_SERVICE_STATUS = "REQUEST_SERVICE_STATUS";
const requestServiceStatus = () => ({type: REQUEST_SERVICE_STATUS});

export const RECEIVE_SERVICE_STATUS = "RECEIVE_SERVICE_STATUS";
const receiveServiceStatus = data => ({
    type: RECEIVE_SERVICE_STATUS,
    status: data,
    receivedAt: Date.now()
});

export const INVALIDATE_SERVICE_STATUS = "INVALIDATE_SERVICE_STATUS";
export const invalidateServiceStatus = () => ({
    type: INVALIDATE_SERVICE_STATUS
});

export const fetchServicesWithStatus = () => {
   return async (dispatch, getState) => {
       await dispatch(fetchServices());
       await dispatch(requestServiceStatus());
       const serviceInfoURLs = getState().services.items.map(service => `/api${service.url}/service-info`);
       const responses = await Promise.all(serviceInfoURLs.map(u => fetch(u)));

       let statusData = {};
       getState().services.items.forEach((s, i) => {
           statusData[s.id] = responses[i].ok;
       });

       return dispatch(receiveServiceStatus(statusData));
   }
};
