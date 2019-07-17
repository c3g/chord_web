import React, {Component} from "react";

import {Typography} from "antd";
import "antd/es/typography/style/css";

import DiscoverySearchForm from "./DiscoverySearchForm";

class DiscoverySchemaContent extends Component {
    render() {
        return this.props.dataset ? (
            <div>
                <Typography.Title level={2}>Search Dataset {this.props.dataset.id}</Typography.Title>
                <DiscoverySearchForm dataset={this.props.dataset} />
            </div>
        ) : (<div>Loading...</div>);
    }
}

export default DiscoverySchemaContent;
