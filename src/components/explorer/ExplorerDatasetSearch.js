import React, {Component} from "react";
import {connect} from "react-redux";
import {Link, withRouter} from "react-router-dom";
import PropTypes from "prop-types";

import {Button, Table, Typography} from "antd";
import "antd/es/button/style/css";
import "antd/es/table/style/css";
import "antd/es/typography/style/css";

import DiscoveryQueryBuilder from "../discovery/DiscoveryQueryBuilder";
import {
    addDataTypeFormIfPossible,
    extractQueriesFromDataTypeForms,
    removeDataTypeFormIfPossible,
    updateDataTypeFormIfPossible
} from "../../utils/search";
import fetch from "cross-fetch";
import {datasetPropTypesShape, serviceInfoPropTypesShape} from "../../propTypes";


const SEARCH_RESULT_COLUMNS = [
    {
        title: "Individual",
        dataIndex: "individual",
        render: individual => <Link to={"/"}>{individual.id}</Link>,
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

        this.setDataTypeForms = this.setDataTypeForms.bind(this);
        this.handleSearch = this.handleSearch.bind(this);

        this.state = {
            dataTypeForms: [],
            fetchingSearch: false,  // TODO: redux
            searchResultsByDataset: {},
        };
    }

    setDataTypeForms(dataTypeForms) {
        this.setState({dataTypeForms});
    }

    async handleSearch() {
        const dataTypeQueries = extractQueriesFromDataTypeForms(this.state.dataTypeForms);

        // TODO: What to do if phenopacket data type not present?
        // Must include phenopacket/experiment query so we can include the data in the results
        if (!dataTypeQueries.hasOwnProperty("phenopacket")) dataTypeQueries["phenopacket"] = true;
        if (!dataTypeQueries.hasOwnProperty("experiment")) dataTypeQueries["experiment"] = true;

        this.setState({fetchingSearch: true});

        try {
            const selectedDatasetID = this.props.match.params.dataset;
            if (!selectedDatasetID) return;

            // TODO: This should be done server side
            const r = await fetch(
                `${this.props.federationServiceInfo.url}/private/dataset-search/${selectedDatasetID}`,
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        data_type_queries: dataTypeQueries,
                        join_query: null
                    })
                });

            const results = await r.json();

            this.setState({
                searchResultsByDataset: {
                    ...this.state.searchResultsByDataset,
                    [selectedDatasetID]: {
                        results: (results || {}).results || [],
                        searchResults: this.tableSearchResults(results)
                    }
                }
            });

            console.log(results);
        } catch (err) {
            console.error(err);
        }

        this.setState({fetchingSearch: false});
    }

    tableSearchResults(searchResults) {
        const results = (searchResults || {}).results || [];
        const tableResultSet = {};

        (results.phenopacket || []).forEach(p => {
            const individualID = p.subject.id;
            if (!tableResultSet.hasOwnProperty(individualID)) {
                tableResultSet[individualID] = {
                    key: individualID,
                    individual: p.subject,
                    biosamples: {},
                    experiments: [],  // TODO
                };
            }

            p.biosamples.forEach(b => tableResultSet[individualID].biosamples[b.id] = b);
        });

        return Object.values(tableResultSet).map(i => ({
            ...i,
            biosamples: Object.values(i.biosamples).sort((b1, b2) => b1.id.localeCompare(b2.id)),
        }));
    }

    render() {
        if (!this.props.match.params.dataset) return null;  // TODO

        const selectedDataset = this.props.datasetsByID[this.props.match.params.dataset];

        if (!selectedDataset) return null;  // TODO

        return <>
            <Typography.Title level={4}>Explore Dataset {selectedDataset.title}</Typography.Title>
            <DiscoveryQueryBuilder isInternal={true}
                                   dataTypeForms={this.state.dataTypeForms}
                                   onSubmit={() => this.handleSearch()}
                                   searchLoading={this.state.fetchingSearch}
                                   addDataTypeQueryForm={dt => this.setDataTypeForms(
                                       addDataTypeFormIfPossible(this.state.dataTypeForms, dt))}
                                   updateDataTypeQueryForm={(dt, fs) => this.setDataTypeForms(
                                       updateDataTypeFormIfPossible(this.state.dataTypeForms, dt, fs))}
                                   removeDataTypeQueryForm={dt => this.setDataTypeForms(
                                       removeDataTypeFormIfPossible(this.state.dataTypeForms, dt))} />
            {this.state.searchResultsByDataset[selectedDataset.identifier] ? <>
                <Typography.Title level={4}>
                    Search Results
                    <div style={{float: "right", verticalAlign: "top"}}>
                        <Button icon="profile" style={{marginRight: "8px"}}>Visualize Tracks</Button>
                        <Button icon="export">Export as CSV</Button>
                    </div>
                </Typography.Title>
                <Table bordered
                       columns={SEARCH_RESULT_COLUMNS}
                       dataSource={this.state.searchResultsByDataset[selectedDataset.identifier].searchResults}
                       rowSelection={() => {}} />
            </> : null}
        </>;
    }
}

ExplorerDatasetSearch.propTypes = {
    federationServiceInfo: serviceInfoPropTypesShape,
    datasetsByID: PropTypes.objectOf(datasetPropTypesShape),
};

const mapStateToProps = state => ({
    federationServiceInfo: state.services.federationService,
    datasetsByID: Object.fromEntries(state.projects.items
        .flatMap(p => p.datasets.map(d => [d.identifier, {...d, project: p.identifier}]))),
});

export default withRouter(connect(mapStateToProps)(ExplorerDatasetSearch));
