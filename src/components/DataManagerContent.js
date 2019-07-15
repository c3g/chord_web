import React, {Component} from "react";

import {Typography} from "antd";
import "antd/es/typography/style/css";

class DataManagerContent extends Component {
    componentDidMount() {
        document.title = "CHORD - Manage Your Data";
    }

    render() {
        return (
            <div>
                <Typography.Title level={2}>Manage Your Data</Typography.Title>
            </div>
        );
    }
}

export default DataManagerContent;
