import React, {Component} from "react";
import {connect} from "react-redux";

import {Typography} from "antd";
import "antd/es/typography/style/css";

import SchemaTree from "../SchemaTree";

class DiscoverySchemaContent extends Component {
    render() {
        return this.props.dataset ? (
            <div>
                <Typography.Title level={2}>Schema for Dataset '{this.props.dataset.id}'</Typography.Title>
                <SchemaTree schema={this.props.dataset.schema} />
            </div>
        ) : (<div>Loading...</div>);
    }
}

const mapStateToProps = state => {
    const sID = state.discovery.selectedServiceID;
    const dID = state.discovery.selectedDatasetID;

    const datasetExists = sID && dID && sID in state.serviceDatasets.datasetsByServiceAndDatasetID
        && dID in state.serviceDatasets.datasetsByServiceAndDatasetID[sID];

    return {
        dataset: datasetExists
            ? state.serviceDatasets.datasetsByServiceAndDatasetID[sID][dID]
            : null,
    };
};

export default connect(mapStateToProps)(DiscoverySchemaContent);
