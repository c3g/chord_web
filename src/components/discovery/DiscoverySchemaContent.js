import React, {Component} from "react";

import {Typography} from "antd";
import "antd/es/typography/style/css";

import SchemaTree from "../SchemaTree";

class DiscoverySchemaContent extends Component {
    render() {
        return this.props.dataset ? (
            <div>
                <Typography.Title level={2}>Schema for Dataset {this.props.dataset.id}</Typography.Title>
                <SchemaTree schema={this.props.dataset.schema} />
            </div>
        ) : (<div>Loading...</div>);
    }
}

export default DiscoverySchemaContent;
