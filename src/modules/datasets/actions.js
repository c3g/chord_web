export const REQUEST_DATASETS = "REQUEST_DATASETS";
const requestDatasets = (serviceID, dataTypeID) => ({
    type: REQUEST_DATASETS,
    serviceID,
    dataTypeID
});

export const RECEIVE_DATASETS = "RECEIVE_DATASETS";
const receiveDatasets = (serviceID, dataTypeID, datasets) => ({
    type: RECEIVE_DATASETS,
    serviceID,
    dataTypeID,
    datasets,
    receivedAt: Date.now()
});
