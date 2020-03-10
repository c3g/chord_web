import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import PropTypes from "prop-types";

import {Typography} from "antd";
import "antd/es/typography/style/css";

import DiscoveryQueryBuilder from "../discovery/DiscoveryQueryBuilder";
import {
    addDataTypeFormIfPossible,
    extractQueriesFromDataTypeForms,
    removeDataTypeFormIfPossible,
    updateDataTypeFormIfPossible
} from "../../search";
import {datasetPropTypesShape, serviceInfoPropTypesShape} from "../../utils";
import fetch from "cross-fetch";

class ExplorerDatasetSearch extends Component {
    constructor(props) {
        super(props);

        this.handleDatasetChange = this.handleDatasetChange.bind(this);
        this.setDataTypeForms = this.setDataTypeForms.bind(this);
        this.handleSearch = this.handleSearch.bind(this);

        this.state = {
            dataTypeForms: [],
            fetchingSearch: false,  // TODO: redux
        };
    }

    handleDatasetChange(dataset) {
        this.setState({
            selectedDataset: dataset || null,
            dataTypeForms: []
        });
    }

    setDataTypeForms(dataTypeForms) {
        this.setState({dataTypeForms});
    }

    async handleSearch() {
        const dataTypeQueries = extractQueriesFromDataTypeForms(this.state.dataTypeForms);
        console.log(dataTypeQueries);

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

            console.log(results);
        } catch (err) {
            console.error(err);
        }

        this.setState({fetchingSearch: false});
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
