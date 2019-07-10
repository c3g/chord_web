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
    return dispatch => {
        dispatch(requestServices());
        return fetch("/api/service_registry/services")
            .then(response => response.json(), error => console.log(error))
            .then(data => dispatch(receiveServices(data)));
    };
};
