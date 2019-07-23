import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Collapse, Divider, Empty, Spin, Table, Typography} from "antd";
import "antd/es/collapse/style/css";
import "antd/es/divider/style/css";
import "antd/es/empty/style/css";
import "antd/es/spin/style/css";
import "antd/es/table/style/css";
import "antd/es/typography/style/css";

import DiscoverySearchForm from "./DiscoverySearchForm";
import {performSearch, selectSearch, updateDiscoverySearchForm} from "../../actions";

class DiscoverySearchContent extends Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleSearchSelect = this.handleSearchSelect.bind(this);
        this.renderSearches = this.renderSearches.bind(this);
        this.handleFormChange = this.handleFormChange.bind(this);
    }

    handleFormChange(fields) {
        if (this.props.dataType === null) return;
        this.props.updateSearchForm(this.props.service.id, this.props.dataType.id, fields);
    }

    handleSubmit(conditions) {
        if (this.props.dataType === null) return;
        this.props.requestSearch(this.props.service.id, this.props.dataType.id, conditions);
    }

    handleSearchSelect(searchIndex) {
        if (this.props.dataType === null) return;
        this.props.selectSearch(this.props.service.id, this.props.dataType.id, parseInt(searchIndex, 10));
    }

    renderSearches() {
        if (!this.props.dataType || !this.props.searches || this.props.searches.length === 0) return (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Searches" />
        );

        return (
            <Collapse bordered={false} accordion={true} activeKey={this.props.selectedSearch.toString()}
                      onChange={this.handleSearchSelect}>
                {[...this.props.searches].reverse().map((s, i) => (
                    <Collapse.Panel header={`Search ${this.props.searches.length - i}`}
                                    key={this.props.searches.length - i - 1}>
                        <Table bordered={true} dataSource={s.results} rowKey="id"
                               columns={[{title: "Dataset ID", dataIndex: "id"}]} />
                    </Collapse.Panel>
                ))}
            </Collapse>
        );
    }

    render() {
        return this.props.dataType ? (
            <div>
                <Typography.Title level={2}>Search Data Type '{this.props.dataType.id}'</Typography.Title>
                <DiscoverySearchForm dataType={this.props.dataType} formValues={this.props.formValues}
                                     loading={this.props.searchLoading}
                                     onChange={this.handleFormChange} onSubmit={this.handleSubmit} />
                <Divider />
                <Typography.Title level={3}>Results</Typography.Title>
                <Spin spinning={this.props.searchLoading}>
                    {this.renderSearches()}
                </Spin>
            </div>
        ) : (<div>Loading...</div>);
    }
}

DiscoverySearchContent.propTypes = {
    onSearchSelect: PropTypes.func,
    service: PropTypes.object,
    dataType: PropTypes.object,
    searches: PropTypes.array,
    selectedSearch: PropTypes.number,
    searchLoading: PropTypes.bool,
    formValues: PropTypes.object
};

const mapStateToProps = state => {
    const sID = state.discovery.selectedServiceID;
    const dID = state.discovery.selectedDataTypeID;

    const dataTypeExists = sID && dID && sID in state.serviceDataTypes.dataTypesByServiceAndDataTypeID
        && dID in state.serviceDataTypes.dataTypesByServiceAndDataTypeID[sID];

    const searchesExist = state.discovery.searchesByServiceAndDataTypeID[sID] !== undefined
        && state.discovery.searchesByServiceAndDataTypeID[sID][dID] !== undefined;

    const selectedSearchExists = state.discovery.selectedSearchByServiceAndDataTypeID[sID] !== undefined
        && state.discovery.selectedSearchByServiceAndDataTypeID[sID][dID] !== undefined;

    return {
        service: dataTypeExists
            ? state.services.itemsByID[sID]
            : null,
        dataType: dataTypeExists
            ? state.serviceDataTypes.dataTypesByServiceAndDataTypeID[sID][dID]
            : null,
        searches: dataTypeExists && searchesExist
            ? state.discovery.searchesByServiceAndDataTypeID[sID][dID]
            : [],
        selectedSearch: dataTypeExists && selectedSearchExists
            ? state.discovery.selectedSearchByServiceAndDataTypeID[sID][dID]
            : -1,

        searchLoading: state.discovery.isFetching,

        formValues: dataTypeExists ?
            state.discovery.searchFormsByServiceAndDataTypeID[sID][dID]
            : null
    };
};

const mapDispatchToProps = dispatch => ({
    updateSearchForm: (serviceID, dataTypeID, fields) =>
        dispatch(updateDiscoverySearchForm(serviceID, dataTypeID, fields)),
    requestSearch: (serviceID, dataTypeID, conditions) => dispatch(performSearch(serviceID, dataTypeID, conditions)),
    selectSearch: (serviceID, dataTypeID, searchIndex) => dispatch(selectSearch(serviceID, dataTypeID, searchIndex)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DiscoverySearchContent);
