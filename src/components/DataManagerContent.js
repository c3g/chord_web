import React, {Component} from "react";

import {Layout, PageHeader, Typography} from "antd";
import "antd/es/layout/style/css";
import "antd/es/typography/style/css";

class DataManagerContent extends Component {
    componentDidMount() {
        document.title = "CHORD - Manage Your Data";
    }

    render() {
        return (
            <div>
                <PageHeader title="Data Manager" subTitle="Share data with the CHORD federation"
                            style={{borderBottom: "1px solid rgb(232, 232, 232)"}}/>
                <Layout>
                    <Layout.Content style={{background: "white", padding: "24px"}}>
                        <Typography.Title level={2}>Manage Your Data</Typography.Title>
                    </Layout.Content>
                </Layout>
            </div>
        );
    }
}

export default DataManagerContent;
