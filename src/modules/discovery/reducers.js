import {simpleDeepCopy} from "../../utils";

import {
    TOGGLE_DISCOVERY_SCHEMA_MODAL,

    PERFORM_SEARCH,
    SELECT_SEARCH,

    ADD_DATA_TYPE_QUERY_FORM,
    UPDATE_DATA_TYPE_QUERY_FORM,
    REMOVE_DATA_TYPE_QUERY_FORM,
    REMOVE_ALL_DATA_TYPE_QUERY_FORMS,
} from "./actions";

export const discovery = (
    state = {
        isFetching: false,

        schemaModalShown: false,

        dataTypeForms: [],
        joinForm: null,

        searches: [],
        selectedSearch: null,
    },
    action
) => {
    switch (action.type) {
        case TOGGLE_DISCOVERY_SCHEMA_MODAL:
            return {...state, schemaModalShown: !state.schemaModalShown};

        case PERFORM_SEARCH.REQUEST:
            return {...state, isFetching: true};

        case PERFORM_SEARCH.RECEIVE:
            return {
                ...state,
                isFetching: false,
                searches: [...state.searches, action.data], // Add search to search history
                lastUpdated: action.receivedAt
            };

        case PERFORM_SEARCH.ERROR:
            return {...state, isFetching: false};

        case SELECT_SEARCH:
            return {
                ...state,
                selectedSearch: action.searchIndex
            };

        case ADD_DATA_TYPE_QUERY_FORM:
            return {
                ...state,
                dataTypeForms: (state.dataTypeForms.map(d => d.dataType.id).includes(action.dataType.id))
                    ? state.dataTypeForms
                    : [...(state.dataTypeForms || []), {dataType: action.dataType, formValues: {}}]
            };

        case UPDATE_DATA_TYPE_QUERY_FORM:
            return {
                ...state,
                dataTypeForms: state.dataTypeForms.map(d => d.dataType.id === action.dataType.id
                    ? {...d, formValues: simpleDeepCopy(action.fields)} : d)  // TODO: Hack-y deep clone
            };

        case REMOVE_DATA_TYPE_QUERY_FORM:
            return {...state, dataTypeForms: state.dataTypeForms.filter(d => d.dataType.id !== action.dataType.id)};

        case REMOVE_ALL_DATA_TYPE_QUERY_FORMS:
            return {...state, dataTypeForms: []};

        // TODO: Update join query form

        default:
            return state;
    }
};
