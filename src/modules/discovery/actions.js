import {basicAction, createNetworkActionTypes, networkAction} from "../../utils/actions"


export const TOGGLE_DISCOVERY_SCHEMA_MODAL = "TOGGLE_DISCOVERY_SCHEMA_MODAL";

export const PERFORM_SEARCH = createNetworkActionTypes("PERFORM_SEARCH");
export const SELECT_SEARCH = "SELECT_SEARCH";

export const ADD_DATA_TYPE_QUERY_FORM = "ADD_DATA_TYPE_QUERY_FORM";
export const UPDATE_DATA_TYPE_QUERY_FORM = "UPDATE_DATA_TYPE_QUERY_FORM";
export const REMOVE_DATA_TYPE_QUERY_FORM = "REMOVE_DATA_TYPE_QUERY_FORM";
export const REMOVE_ALL_DATA_TYPE_QUERY_FORMS = "REMOVE_ALL_DATA_TYPE_QUERY_FORMS";

export const UPDATE_JOIN_QUERY_FORM = "UPDATE_JOIN_QUERY_FORM";


export const toggleDiscoverySchemaModal = basicAction(TOGGLE_DISCOVERY_SCHEMA_MODAL);

export const selectSearch = searchIndex => ({
    type: SELECT_SEARCH,
    searchIndex
});


const performSearch = networkAction((dataTypeQueries, joinQuery=true) => (dispatch, getState) => ({
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
    afterAction: () => async (dispatch, getState) =>
        await dispatch(selectSearch(getState().discovery.searches.length - 1))
}));

export const performFullSearchIfPossible = () => async (dispatch, getState) => {
    if (getState().discovery.isFetching) return;

    // TODO: Check that forms are valid first
    const dataTypeQueries = Object.fromEntries(getState().discovery.dataTypeForms.map(d => [
        d.dataType.id,
        ((d.formValues || {conditions: []}).conditions || []).map(({value}) => {
            let exp = [`#${value.operation}`,
                ["#resolve", ...value.field.split(".").slice(1)],
                value.searchValue];

            if (value.negated) exp = ["#not", exp];
            return exp;
        }).reduce((se, v) => ["#and", se, v])
    ]));

    const joinQuery = true;  // TODO

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
