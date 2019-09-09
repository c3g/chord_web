import PropTypes from "prop-types";

// Gives components which include this in their state to props connection access to workflows and loading status.
export const workflowsStateToPropsMixin = state => ({
    workflows: Object.values(state.serviceWorkflows.workflowsByServiceID)
        .filter(s => !s.isFetching)
        .flatMap(s => Object.values(s.workflows.ingestion)),
    workflowsLoading: state.services.isFetchingAll || state.serviceWorkflows.isFetchingAll
});

// Prop types object shape for a single workflow object.
export const workflowPropTypesShape = PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    data_types: PropTypes.arrayOf(PropTypes.string),
    inputs: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.string,
        id: PropTypes.string,
        extensions: PropTypes.arrayOf(PropTypes.string)  // File type only
    })),
    outputs: PropTypes.arrayOf(PropTypes.string)  // TODO: This is going to change
});

// Any components which include workflowStateToPropsMixin should include this as well in their prop types.
export const workflowsStateToPropsMixinPropTypes = {
    workflows: PropTypes.arrayOf(workflowPropTypesShape),
    workflowsLoading: PropTypes.bool
};
