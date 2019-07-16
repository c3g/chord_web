import React, {Component} from "react";

import {Layout, Typography} from "antd";
import "antd/es/layout/style/css";
import "antd/es/typography/style/css";

class DataManagerContent extends Component {
    componentDidMount() {
        document.title = "CHORD - Manage Your Data";
    }

    render() {
        return (
            <Layout>
                <Layout.Content style={{background: "white", padding: "24px 32px"}}>
                    <Typography.Title level={2}>Manage Your Data</Typography.Title>
                </Layout.Content>
            </Layout>
        );
    }
}

export default DataManagerContent;
