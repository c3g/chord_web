import React, {Component} from "react";
import {connect} from "react-redux";

import {Typography} from "antd";
import "antd/es/typography/style/css";

import SchemaTree from "../SchemaTree";

class DiscoveryDataTypeSchemaContent extends Component {
    render() {
        return this.props.dataType ? (
            <div>
                <Typography.Title level={2}>Schema for Data Type '{this.props.dataType.id}'</Typography.Title>
                <SchemaTree schema={this.props.dataType.schema} />
            </div>
        ) : (<div>Loading...</div>);
    }
}

const mapStateToProps = state => {
    const sID = state.discovery.selectedServiceID;
    const dID = state.discovery.selectedDataTypeID;

    const dataTypeExists = sID && dID && sID in state.serviceDataTypes.dataTypesByServiceAndDataTypeID
        && dID in state.serviceDataTypes.dataTypesByServiceAndDataTypeID[sID];

    return {
        dataType: dataTypeExists
            ? state.serviceDataTypes.dataTypesByServiceAndDataTypeID[sID][dID]
            : null,
    };
};

export default connect(mapStateToProps)(DiscoveryDataTypeSchemaContent);
