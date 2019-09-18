import {
    FETCH_RUN_DETAILS,
    FETCH_RUNS,
    SUBMIT_INGESTION_RUN
} from "./actions";

export const runs = (
    state = {
        isFetching: false,
        isSubmittingIngestionRun: false,
        items: [],
        itemDetails: {}
    },
    action
) => {
    switch (action.type) {
        case FETCH_RUNS.REQUEST:
            return {...state, isFetching: true};

        case FETCH_RUNS.RECEIVE:
            return {
                ...state,
                isFetching: false,
                items: action.data
            };

        case FETCH_RUNS.ERROR:
            return {...state, isFetching: false};

        case FETCH_RUN_DETAILS.REQUEST:
            return {
                ...state,
                itemDetails: {
                    ...state.itemDetails,
                    [action.runID]: {
                        isFetching: true,
                        details: (state.itemDetails[action.runID] || {details: null}).details
                    }
                }
            };

        case FETCH_RUN_DETAILS.RECEIVE:
            return {
                ...state,
                isFetching: false,
                items: state.items.map(i => i.run_id === action.runID ? {...i, state: action.data.state} : i),
                itemDetails: {
                    ...state.itemDetails,
                    [action.runID]: {
                        isFetching: false,
                        details: action.data
                    }
                }
            };

        case FETCH_RUN_DETAILS.ERROR:
            return {
                ...state,
                itemDetails: {
                    ...state.itemDetails,
                    [action.runID]: {
                        isFetching: false,
                        details: (state.itemDetails[action.runID] || {details: null}).details
                    }
                }
            };

        case SUBMIT_INGESTION_RUN.REQUEST:
            return {...state, isSubmittingIngestionRun: true};

        case SUBMIT_INGESTION_RUN.RECEIVE:  // TODO: Do something here
        case SUBMIT_INGESTION_RUN.ERROR:
            return {...state, isSubmittingIngestionRun: false};

        default:
            return state;
    }
};
