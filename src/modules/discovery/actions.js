import {createNetworkActionTypes, networkAction} from "../../utils/actions"


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
    req: {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            data_type_queries: dataTypeQueries,
            join_query: joinQuery
        })
    },
    err: "Error performing search",
    onSuccess: () => dispatch(selectSearch(getState().discovery.searches.length - 1))
}));



const conditionsToQuery = conditions => conditions
    .filter(c => c.value && c.value.field)
    .map(({value}) =>
        (exp => value.negated ? ["#not", exp] : exp)(  // Negate expression if needed
            [`#${value.operation}`,
                ["#resolve", ...value.field.split(".").slice(1)],
                value.field2 ? ["#resolve", ...value.field2.split(".").slice(1)] : value.searchValue]
        ))
    .reduce((se, v) => ["#and", se, v]);

export const performFullSearchIfPossible = () => async (dispatch, getState) => {
    if (getState().discovery.isFetching) return;

    // TODO: Check that forms are valid first (via refs somehow - passed as arguments?)

    // TODO: Map keys to avoid issues!!! Otherwise "deleted" conditions show up

    const dataTypeQueries = Object.fromEntries(getState().discovery.dataTypeForms.map(d =>
        [d.dataType.id, conditionsToQuery(
            (((d.formValues || {keys: {value: []}}).keys || {value: []}).value || [])
                .map(k => ((d.formValues || {conditions: []}).conditions || [])[k] || null)
                .filter(c => c !== null)
        )]));

    // TODO: Add data types and [item] to resolve...

    const joinFormValues = getState().discovery.joinFormValues;
    const joinQueryConditions = (((joinFormValues || {keys: {value: []}}).keys || {value: []}).value || [])
        .map(k => ((joinFormValues || {conditions: []}).conditions || [])[k] || null)
        .filter(c => c !== null);
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


export const updateJoinQueryForm = fields => ({
    type: UPDATE_JOIN_QUERY_FORM,
    fields
});
