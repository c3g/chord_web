import React, {Component} from "react";
import {connect} from "react-redux";
import {Link, withRouter} from "react-router-dom";
import PropTypes from "prop-types";

import {Button, Table, Typography} from "antd";
import "antd/es/button/style/css";
import "antd/es/table/style/css";
import "antd/es/typography/style/css";

import DiscoveryQueryBuilder from "../discovery/DiscoveryQueryBuilder";
import SearchSummaryModal from "./SearchSummaryModal";

import {datasetPropTypesShape, serviceInfoPropTypesShape} from "../../propTypes";
import {
    addDataTypeQueryForm,
    performSearchIfPossible,
    removeDataTypeQueryForm,
    updateDataTypeQueryForm,
    setSelectedRows,
} from "../../modules/explorer/actions";
import {withBasePath} from "../../utils/url";


const SEARCH_RESULT_COLUMNS = [
    {
        title: "Individual",
        dataIndex: "individual",
        render: individual => <Link to={location => ({
            pathname: withBasePath(`data/explorer/individuals/${individual.id}/overview`),
            state: {backUrl: location.pathname},
        })}>{individual.id}</Link>,
        sorter: (a, b) => a.individual.id.localeCompare(b.individual.id),
        defaultSortOrder: "ascend",
    },
    {
        title: "Samples",
        dataIndex: "biosamples",
        render: samples => <>
            {samples.length} Sample{samples.length === 1 ? "" : "s"}{samples.length ? ": " : ""}
            {samples.map(b => b.id).join(", ")}
        </>,
    },
    {
        title: "Experiments",
        dataIndex: "experiments",
        render: experiments => <>{experiments.length} Experiment{experiments.length === 1 ? "" : "s"}</>,
    },
];


class ExplorerDatasetSearch extends Component {
    constructor(props) {
        super(props);
        this.state = {
            summaryModalVisible: false,
        };
    }

    render() {
        if (!this.props.match.params.dataset) return null;  // TODO

        const selectedDataset = this.props.datasetsByID[this.props.match.params.dataset];

        if (!selectedDataset) return null;  // TODO

        return <>
            <Typography.Title level={4}>Explore Dataset {selectedDataset.title}</Typography.Title>
            <DiscoveryQueryBuilder isInternal={true}
                                   dataTypeForms={this.props.dataTypeForms}
                                   onSubmit={() => this.props.performSearch()}
                                   searchLoading={this.props.fetchingSearch}
                                   addDataTypeQueryForm={this.props.addDataTypeQueryForm}
                                   updateDataTypeQueryForm={this.props.updateDataTypeQueryForm}
                                   removeDataTypeQueryForm={this.props.removeDataTypeQueryForm} />
            {this.props.searchResults ? <>
                <Typography.Title level={4}>
                    Search Results
                    <div style={{float: "right", verticalAlign: "top"}}>
                        {/* TODO: v0.2 */}
                        {/*<Button icon="profile" style={{marginRight: "8px"}}>Visualize Tracks</Button>*/}
                        <Button icon="bar-chart"
                                style={{marginRight: "8px"}}
                                onClick={() => this.setState({summaryModalVisible: true})}>View Summary</Button>
                        <Button icon="export">Export as CSV</Button>
                    </div>
                </Typography.Title>
                <SearchSummaryModal visible={this.state.summaryModalVisible}
                                    onClose={() => this.setState({summaryModalVisible: false})} />
                <Table bordered
                       size="middle"
                       columns={SEARCH_RESULT_COLUMNS}
                       dataSource={this.props.searchResults.searchFormattedResults || []}
                       pagination={{pageSize: 25}}
                       rowSelection={{
                           selectedRowKeys: this.props.selectedRows,
                           onChange: this.props.setSelectedRows,
                           selections: [
                               {
                                   key: "select-all-data",
                                   text: "Select all data",
                                   onSelect: () => this.props.setSelectedRows(
                                       (this.props.searchResults.searchFormattedResults || []).map(r => r.key)
                                   ),
                               },
                               {
                                   key: "unselect-all-data",
                                   text: "Unselect all data",
                                   onSelect: () => this.props.setSelectedRows([]),
                               },
                           ],
                       }} />
            </> : null}
        </>;
    }
}

ExplorerDatasetSearch.propTypes = {
    dataTypeForms: PropTypes.arrayOf(PropTypes.object),
    fetchingSearch: PropTypes.bool,
    searchResults: PropTypes.object,
    selectedRows: PropTypes.arrayOf(PropTypes.string),

    addDataTypeQueryForm: PropTypes.func,
    updateDataTypeQueryForm: PropTypes.func,
    removeDataTypeQueryForm: PropTypes.func,
    performSearch: PropTypes.func,

    federationServiceInfo: serviceInfoPropTypesShape,
    datasetsByID: PropTypes.objectOf(datasetPropTypesShape),
};

const mapStateToProps = (state, ownProps) => {
    const datasetID = ownProps.match.params.dataset;
    return {
        dataTypeForms: state.explorer.dataTypeFormsByDatasetID[datasetID] || [],
        fetchingSearch: state.explorer.fetchingSearchByDatasetID[datasetID] || false,
        searchResults: state.explorer.searchResultsByDatasetID[datasetID] || null,
        selectedRows: state.explorer.selectedRowsByDatasetID[datasetID] || [],

        federationServiceInfo: state.services.federationService,
        datasetsByID: Object.fromEntries(state.projects.items
            .flatMap(p => p.datasets.map(d => [d.identifier, {...d, project: p.identifier}]))),
    };
}

const mapDispatchToProps = (dispatch, ownProps) => {
    const datasetID = ownProps.match.params.dataset;
    return {
        addDataTypeQueryForm: dataType => dispatch(addDataTypeQueryForm(datasetID, dataType)),
        updateDataTypeQueryForm: (dataType, fields) => dispatch(updateDataTypeQueryForm(datasetID, dataType, fields)),
        removeDataTypeQueryForm: dataType => dispatch(removeDataTypeQueryForm(datasetID, dataType)),
        performSearch: () => dispatch(performSearchIfPossible(datasetID)),
        setSelectedRows: selectedRows => dispatch(setSelectedRows(datasetID, selectedRows)),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ExplorerDatasetSearch));
