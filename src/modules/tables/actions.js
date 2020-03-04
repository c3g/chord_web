import {createNetworkActionTypes, networkAction} from "../../utils/actions";

export const FETCH_TABLE_SUMMARY = createNetworkActionTypes("FETCH_TABLE_SUMMARY");

const fetchTableSummary = networkAction((chordService, serviceInfo, tableID) => ({
    types: FETCH_TABLE_SUMMARY,
    params: {chordService, tableID},
    url: `${serviceInfo.url}/tables/${tableID}/summary`  // TODO: Private...
}));

export const fetchTableSummaryIfPossible = (chordService, serviceInfo, tableID) => async (dispatch, getState) => {
    if (getState().tableSummaries.isFetching) return;
    await dispatch(fetchTableSummary(chordService, serviceInfo, tableID));
};
