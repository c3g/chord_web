import React, {Component} from "react";

import {Typography} from "antd";
import "antd/es/typography/style/css";

import DiscoverySearchForm from "./DiscoverySearchForm";

class DiscoverySchemaContent extends Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(cs) {
        this.props.onSubmit(cs);
    }

    render() {
        return this.props.dataset ? (
            <div>
                <Typography.Title level={2}>Search Dataset {this.props.dataset.id}</Typography.Title>
                <DiscoverySearchForm dataset={this.props.dataset} onSubmit={this.handleSubmit} />
            </div>
        ) : (<div>Loading...</div>);
    }
}

export default DiscoverySchemaContent;
