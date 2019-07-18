import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Collapse, Divider, Empty, Table, Typography} from "antd";
import "antd/es/collapse/style/css";
import "antd/es/divider/style/css";
import "antd/es/empty/style/css";
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
        if (this.props.dataset === null) return;
        this.props.updateSearchForm(this.props.service.id, this.props.dataset.id, fields);
    }

    handleSubmit(conditions) {
        if (this.props.dataset === null) return;
        this.props.requestSearch(this.props.service.id, this.props.dataset.id, conditions);
    }

    handleSearchSelect(searchIndex) {
        if (this.props.dataset === null) return;
        this.props.selectSearch(this.props.service.id, this.props.dataset.id, parseInt(searchIndex, 10));
    }

    renderSearches() {
        if (!this.props.dataset || !this.props.searches || this.props.searches.length === 0) return (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Searches" />
        );

        return (
            <Collapse bordered={false} accordion={true} activeKey={this.props.selectedSearch.toString()}
                      onChange={this.handleSearchSelect}>
                {[...this.props.searches].reverse().map((s, i) => (
                    <Collapse.Panel header={`Search ${this.props.searches.length - i}`}
                                    key={this.props.searches.length - i - 1}>
                        <Table bordered={true} dataSource={s.results} rowKey="id"
                               columns={Object.keys(this.props.dataset.schema.properties)
                                   .map(e => ({title: e, dataIndex: e}))} />
                               {/* TODO: BAD LOGIC (NO NESTED HANDLING, ASSUMES OBJECT AT ROOT LEVEL), HARDCODED ID */}
                    </Collapse.Panel>
                ))}
            </Collapse>
        );
    }

    render() {
        return this.props.dataset ? (
            <div>
                <Typography.Title level={2}>Search Dataset '{this.props.dataset.id}'</Typography.Title>
                <DiscoverySearchForm dataset={this.props.dataset} formValues={this.props.formValues}
                                     onChange={this.handleFormChange} onSubmit={this.handleSubmit} />
                <Divider />
                <Typography.Title level={3}>Results</Typography.Title>
                {this.renderSearches()}
            </div>
        ) : (<div>Loading...</div>);
    }
}

DiscoverySearchContent.propTypes = {
    onSearchSelect: PropTypes.func,
    service: PropTypes.object,
    dataset: PropTypes.object,
    searches: PropTypes.array,
    selectedSearch: PropTypes.number
};

const mapStateToProps = state => {
    const sID = state.discovery.selectedServiceID;
    const dID = state.discovery.selectedDatasetID;

    const datasetExists = sID && dID && sID in state.serviceDatasets.datasetsByServiceAndDatasetID
        && dID in state.serviceDatasets.datasetsByServiceAndDatasetID[sID];

    const searchesExist = state.discovery.searchesByServiceAndDatasetID[sID] !== undefined
        && state.discovery.searchesByServiceAndDatasetID[sID][dID] !== undefined;

    const selectedSearchExists = state.discovery.selectedSearchByServiceAndDatasetID[sID] !== undefined
        && state.discovery.selectedSearchByServiceAndDatasetID[sID][dID] !== undefined;

    return {
        service: datasetExists
            ? state.services.itemsByID[sID]
            : null,
        dataset: datasetExists
            ? state.serviceDatasets.datasetsByServiceAndDatasetID[sID][dID]
            : null,
        searches: datasetExists && searchesExist
            ? state.discovery.searchesByServiceAndDatasetID[sID][dID]
            : [],
        selectedSearch: datasetExists && selectedSearchExists
            ? state.discovery.selectedSearchByServiceAndDatasetID[sID][dID]
            : -1,

        formValues: datasetExists ?
            state.discovery.searchFormsByServiceAndDatasetID[sID][dID]
            : null
    };
};

const mapDispatchToProps = dispatch => ({
    updateSearchForm: (serviceID, datasetID, fields) =>
        dispatch(updateDiscoverySearchForm(serviceID, datasetID, fields)),
    requestSearch: (serviceID, datasetID, conditions) => dispatch(performSearch(serviceID, datasetID, conditions)),
    selectSearch: (serviceID, datasetID, searchIndex) => dispatch(selectSearch(serviceID, datasetID, searchIndex)),
});

export default connect(mapStateToProps, mapDispatchToProps)(DiscoverySearchContent);
