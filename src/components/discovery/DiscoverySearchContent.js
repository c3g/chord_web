import React, {Component} from "react";

import {Typography} from "antd";
import "antd/es/typography/style/css";

import SchemaTreeSelect from "../SchemaTreeSelect";

class DiscoverySchemaContent extends Component {
    render() {
        return this.props.dataset ? (
            <div>
                <Typography.Title level={2}>Search Dataset {this.props.dataset.id}</Typography.Title>
                <SchemaTreeSelect style={{width: 256}} schema={this.props.dataset.schema} />
            </div>
        ) : (<div>Loading...</div>);
    }
}

export default DiscoverySchemaContent;
