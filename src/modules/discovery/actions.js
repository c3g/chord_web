import {conditionsToQuery, extractQueriesFromDataTypeForms, extractQueryConditionsFromFormValues} from "../../search";
import {createNetworkActionTypes, networkAction} from "../../utils/actions"
import {jsonRequest} from "../../utils/requests";


export const PERFORM_SEARCH = createNetworkActionTypes("PERFORM_SEARCH");
export const SELECT_SEARCH = "SELECT_SEARCH";

export const ADD_DATA_TYPE_QUERY_FORM = "ADD_DATA_TYPE_QUERY_FORM";
export const UPDATE_DATA_TYPE_QUERY_FORM = "UPDATE_DATA_TYPE_QUERY_FORM";
export const REMOVE_DATA_TYPE_QUERY_FORM = "REMOVE_DATA_TYPE_QUERY_FORM";
export const REMOVE_ALL_DATA_TYPE_QUERY_FORMS = "REMOVE_ALL_DATA_TYPE_QUERY_FORMS";

export const UPDATE_JOIN_QUERY_FORM = "UPDATE_JOIN_QUERY_FORM";


export const selectSearch = searchIndex => ({
    type: SELECT_SEARCH,
    searchIndex
});


const performSearch = networkAction((dataTypeQueries, joinQuery=null) => (dispatch, getState) => ({
    types: PERFORM_SEARCH,
    url: `${getState().services.federationService.url}/federated-dataset-search`,
    req: jsonRequest({
        data_type_queries: dataTypeQueries,
        join_query: joinQuery
    }, "POST"),
    err: "Error performing search",
    onSuccess: () => dispatch(selectSearch(getState().discovery.searches.length - 1))
}));


export const performFullSearchIfPossible = () => async (dispatch, getState) => {
    if (getState().discovery.isFetching) return;

    // TODO: Map keys to avoid issues!!! Otherwise "deleted" conditions show up

    const dataTypeQueries = extractQueriesFromDataTypeForms(getState().discovery.dataTypeForms);
    if (dataTypeQueries.length === 0) return;  // TODO: Report this; blank data type query (should be caught earlier)

    const joinFormValues = getState().discovery.joinFormValues;
    const joinQueryConditions = extractQueryConditionsFromFormValues(joinFormValues);
    const joinQuery = joinQueryConditions.length > 0 ? conditionsToQuery(joinQueryConditions) : null;

    await dispatch(performSearch(dataTypeQueries, joinQuery));
};


export const addDataTypeQueryForm = dataType => ({
    type: ADD_DATA_TYPE_QUERY_FORM,
    dataType
});

export const updateDataTypeQueryForm = (dataType, fields) => ({
    type: UPDATE_DATA_TYPE_QUERY_FORM,
    dataType,
    fields
});

export const removeDataTypeQueryForm = dataType => ({
    type: REMOVE_DATA_TYPE_QUERY_FORM,
    dataType
});

// export const removeAllDataTypeQueryForms = basicAction(REMOVE_ALL_DATA_TYPE_QUERY_FORMS);


// export const updateJoinQueryForm = fields => ({
//     type: UPDATE_JOIN_QUERY_FORM,
//     fields
// });
