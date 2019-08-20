import React, {Component} from "react";
import {connect} from "react-redux";

import {Button, Col, Layout, Menu, PageHeader, Row, Spin, Table, Typography} from "antd";
import "antd/es/button/style/css";
import "antd/es/layout/style/css";
import "antd/es/menu/style/css";
import "antd/es/page-header/style/css";
import "antd/es/row/style/css";
import "antd/es/spin/style/css";
import "antd/es/table/style/css";
import "antd/es/typography/style/css";

import {fetchServicesWithMetadataAndDataTypesAndDatasetsIfNeeded} from "../modules/services/actions";

class DataManagerContent extends Component {
    componentDidMount() {
        document.title = "CHORD - Manage Your Data";
        this.props.fetchIfNeeded();
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
                    <Layout.Content style={{background: "white", padding: "24px", position: "relative"}}>
                        <Typography.Title level={2}>
                            Project 1
                        </Typography.Title>
                        <div style={{position: "absolute", top: "24px", right: "24px"}}>
                            <Button icon="edit">Edit</Button>
                            <Button type="danger" icon="delete"
                                    style={{verticalAlign: "top", margin: "0 0 0 10px"}}>Delete</Button>
                        </div>
                        <Typography.Paragraph style={{maxWidth: "600px"}}>
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Corporis earum et laboriosam
                            laborum maxime reiciendis sunt temporibus. Alias, consectetur corporis cumque dignissimos
                            eius eveniet ipsa laudantium numquam quis, suscipit vero!
                        </Typography.Paragraph>
                        <Typography.Title level={3}>
                            Datasets
                            <Button icon="plus" style={{verticalAlign: "top", float: "right"}}>
                                Add Dataset
                            </Button>
                        </Typography.Title>
                        <Spin spinning={this.props.loadingDatasets}>
                            <Table bordered dataSource={this.props.datasets} rowKey="id"
                                   expandedRowRender={() => (<span>TODO: List of files</span>)}>
                                <Table.Column dataIndex="id" title="ID" /> {/* TODO: Dataset name */}
                                <Table.Column dataIndex="dataTypeID" title="Data Type" />
                                <Table.Column key="files" title="Files" />
                                <Table.Column key="actions" title="Actions" width={330} render={() => (
                                    <Row gutter={10}>
                                        <Col span={8}><Button icon="team" style={{width: "100%"}}>Share</Button></Col>
                                        <Col span={7}><Button icon="edit" style={{width: "100%"}}>Edit</Button></Col>
                                        <Col span={9}><Button type="danger" icon="delete"
                                                               style={{width: "100%"}}>Delete</Button></Col>
                                    </Row>
                                )} />
                            </Table>
                        </Spin>
                    </Layout.Content>
                </Layout>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const datasets = state.serviceDatasets.datasetsByServiceAndDataTypeID;
    const datasetList = Object.keys(datasets)
        .map(sID => Object.keys(datasets[sID])
            .map(dtID => datasets[sID][dtID].map(ds => ({...ds, dataTypeID: dtID})))
            .flat())
        .flat();
    return {
        loadingDatasets: state.services.isLoadingAllData,
        datasets: datasetList  // TODO
    };
};

const mapDispatchToProps = dispatch => ({
    fetchIfNeeded: () => dispatch(fetchServicesWithMetadataAndDataTypesAndDatasetsIfNeeded())
});

export default connect(mapStateToProps, mapDispatchToProps)(DataManagerContent);
