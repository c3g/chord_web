import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Typography} from "antd";
import "antd/es/typography/style/css";

import SearchList from "./SearchList";

import {
    performFullSearchIfPossible,

    addDataTypeQueryForm,
    updateDataTypeQueryForm,
    removeDataTypeQueryForm,

    // updateJoinQueryForm,
} from "../../modules/discovery/actions";
import DiscoveryQueryBuilder from "./DiscoveryQueryBuilder";


class DiscoverySearchContent extends Component {
    render() {
        return <>
            <DiscoveryQueryBuilder isInternal={false}
                                   dataTypeForms={this.props.dataTypeForms}
                                   addDataTypeQueryForm={this.props.addDataTypeQueryForm}
                                   updateDataTypeQueryForm={this.props.updateDataTypeQueryForm}
                                   removeDataTypeQueryForm={this.props.removeDataTypeQueryForm}
                                   searchLoading={this.props.searchLoading}
                                   onSubmit={() => this.props.performFullSearchIfPossible()} />
            <Typography.Title level={3}>Results</Typography.Title>
            <SearchList />
        </>;
    }
}

DiscoverySearchContent.propTypes = {
    onSearchSelect: PropTypes.func,
    servicesInfo: PropTypes.arrayOf(PropTypes.object),
    dataTypes: PropTypes.object,
    dataTypesByID: PropTypes.object,
    serviceInfo: PropTypes.object,
    dataTypesLoading: PropTypes.bool,
    searchLoading: PropTypes.bool,
    formValues: PropTypes.object,
    dataTypeForms: PropTypes.arrayOf(PropTypes.object),
    // joinFormValues: PropTypes.object,

    performFullSearchIfPossible: PropTypes.func,

    addDataTypeQueryForm: PropTypes.func,
    updateDataTypeQueryForm: PropTypes.func,
    removeDataTypeQueryForm: PropTypes.func,
};

const mapStateToProps = state => ({
    servicesInfo: state.services.items,
    dataTypes: state.serviceDataTypes.dataTypesByServiceID,
    dataTypesByID: state.serviceDataTypes.itemsByID,

    dataTypesLoading: state.services.isFetching || state.serviceDataTypes.isFetchingAll
        || Object.keys(state.serviceDataTypes.dataTypesByServiceID).length === 0,

    schemaModalShown: state.discovery.schemaModalShown,

    searchLoading: state.discovery.isFetching,

    dataTypeForms: state.discovery.dataTypeForms,
    // joinFormValues: state.discovery.joinFormValues,
});

const mapDispatchToProps = dispatch => ({
    performFullSearchIfPossible: () => dispatch(performFullSearchIfPossible()),

    addDataTypeQueryForm: dataType => dispatch(addDataTypeQueryForm(dataType)),
    updateDataTypeQueryForm: (dataType, fields) => dispatch(updateDataTypeQueryForm(dataType, fields)),
    removeDataTypeQueryForm: dataType => dispatch(removeDataTypeQueryForm(dataType)),

    // updateJoinForm: fields => dispatch(updateJoinQueryForm(fields)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DiscoverySearchContent);
