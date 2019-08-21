import React, {Component} from "react";
import PropTypes from "prop-types";

import {Button, Col, Row, Spin, Table, Typography} from "antd";

import "antd/es/button/style/css";
import "antd/es/col/style/css";
import "antd/es/row/style/css";
import "antd/es/spin/style/css";
import "antd/es/table/style/css";
import "antd/es/typography/style/css";

class Project extends Component {
    render() {
        return (
            <div>
                <Typography.Title level={2}>
                    {this.props.project.name}
                </Typography.Title>
                <div style={{position: "absolute", top: "24px", right: "24px"}}>
                    <Button icon="edit">Edit</Button>
                    <Button type="danger" icon="delete"
                            style={{verticalAlign: "top", margin: "0 0 0 10px"}}>Delete</Button>
                </div>
                <Typography.Paragraph style={{maxWidth: "600px"}}>
                    {this.props.project.description}
                </Typography.Paragraph>
                <Typography.Title level={3}>
                    Datasets
                    <div style={{float: "right"}}>
                        <Button icon="plus" style={{verticalAlign: "top"}}>
                            Add Dataset
                        </Button>
                    </div>
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
            </div>
        )
    }
}

Project.propTypes = {
    project: PropTypes.object,
    datasets: PropTypes.arrayOf(PropTypes.object),
    loadingDatasets: PropTypes.bool
};

export default Project;
