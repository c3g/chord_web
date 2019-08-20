import React, {Component} from "react";
import {connect} from "react-redux";

import {Button, Layout, Menu, PageHeader, Table, Typography} from "antd";
import "antd/es/button/style/css";
import "antd/es/layout/style/css";
import "antd/es/menu/style/css";
import "antd/es/page-header/style/css";
import "antd/es/table/style/css";
import "antd/es/typography/style/css";

class DataManagerContent extends Component {
    componentDidMount() {
        document.title = "CHORD - Manage Your Data";
    }

    render() {
        return (
            <div>
                <PageHeader title="Data Manager" subTitle="Share data with the CHORD federation"
                            style={{borderBottom: "1px solid rgb(232, 232, 232)"}}
                            extra={[<Button key="create_project" style={{marginTop: "-3px"}} type="primary"
                                            icon="plus">
                                Create Project
                            </Button>]} />
                <Layout>
                    <Layout.Sider style={{background: "white"}} width={256}>
                        <Menu style={{height: "100%"}} mode="inline">
                            <Menu.Item key="1">Project 1</Menu.Item>
                        </Menu>
                    </Layout.Sider>
                    <Layout.Content style={{background: "white", padding: "24px"}}>
                        <Typography.Title level={2}>
                            Project 1
                            <Button shape="circle" icon="edit" style={{verticalAlign: "top", margin: "6px 0 0 1em"}} />
                        </Typography.Title>
                        <Typography.Paragraph style={{maxWidth: "600px"}}>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corporis earum et laboriosam
                            laborum maxime reiciendis sunt temporibus. Alias, consectetur corporis cumque dignissimos
                            eius eveniet ipsa laudantium numquam quis, suscipit vero!
                        </Typography.Paragraph>
                        <Typography.Title level={3}>
                            Datasets
                            <Button icon="plus" style={{verticalAlign: "top", marginTop: "2px", float: "right"}}>Add Dataset</Button>
                        </Typography.Title>
                        <Table bordered rowSelection={{selectedRowKeys: [], onChange: () => {}}}>
                            <Table.Column title="ID" />
                            <Table.Column title="Data Type" />
                            <Table.Column title="Files" />
                            <Table.Column title="Shared With" />
                            <Table.Column title="Actions" />
                        </Table>
                    </Layout.Content>
                </Layout>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    datasets: []  // TODO
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(DataManagerContent);
