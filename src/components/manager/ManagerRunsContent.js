import React, {Component} from "react";

import {Layout, Table, Typography} from "antd";

import "antd/es/layout/style/css";
import "antd/es/typography/style/css";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";

class ManagerRunsContent extends Component {
    render() {
        return (
            <Layout>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    <Typography.Title level={2}>Workflow Runs</Typography.Title>
                    <Table bordered={true}>
                        <Table.Column title="Run ID" />
                        <Table.Column title="Purpose" width={120} /> {/* TODO: Ingestion or Analysis */}
                        <Table.Column title="Name" />
                        <Table.Column title="Started" />
                        <Table.Column title="Ended" />
                        <Table.Column title="State" width={160} />
                    </Table>
                </Layout.Content>
            </Layout>
        );
    }
}

export default ManagerRunsContent;
