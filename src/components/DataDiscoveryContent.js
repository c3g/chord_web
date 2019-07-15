import React, {Component} from "react";

import {Typography} from "antd";
import "antd/es/typography/style/css";

class DataDiscoveryContent extends Component {
    componentDidMount() {
        document.title = "CHORD - Discover Data";
    }

    render() {
        return (
            <div>
                <Typography.Title level={2}>Discover Data</Typography.Title>
            </div>
        );
    }
}

export default DataDiscoveryContent;
