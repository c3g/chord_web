import React, {Component} from "react";
import PropTypes from "prop-types";

import {Button, Col, Row, Spin, Table, Typography} from "antd";

import "antd/es/button/style/css";
import "antd/es/col/style/css";
import "antd/es/row/style/css";
import "antd/es/spin/style/css";
import "antd/es/table/style/css";
import "antd/es/typography/style/css";

import DataUseDisplay from "../DataUseDisplay";

class Project extends Component {
    static getDerivedStateFromProps(nextProps) {
        // TODO: Want to warn the user if the description has changed and they're editing...
        if ("value" in nextProps) {
            return {...(nextProps.value || {}), editing: nextProps.editing || false};
        }
        return null;
    }

    handleCancelEdit() {
        this._onCancelEdit();
        this.setState({editedName: this.state.name, editedDescription: this.state.description});
    }

    constructor(props) {
        super(props);

        this.onDelete = props.onDelete || (() => {});
        this.onEdit = props.onEdit || (() => {});
        this._onCancelEdit = props.onCancelEdit || (() => {});
        this.onSave = props.onSave || (() => {});

        this.handleCancelEdit = this.handleCancelEdit.bind(this);

        const value = props.value || {};
        this.state = {
            name: value.name || "",
            description: value.description || "",
            data_use: value.data_use || [],

            editing: props.editing || false,
            editedName: value.name || "",
            editedDescription: value.description || ""
        }
    }

    render() {
        return (
            <div>
                <Typography.Title level={2}>
                    {this.state.name}
                </Typography.Title>
                <div style={{position: "absolute", top: "24px", right: "24px"}}>
                    {this.state.editing ? (
                        <>
                            <Button type="primary" icon="check" onClick={() => this.onSave({
                                name: this.state.editedName,
                                description: this.state.editedDescription
                            })}>Save</Button>
                            <Button icon="close"
                                    style={{marginLeft: "10px"}}
                                    onClick={() => this.handleCancelEdit()}>Cancel</Button>
                        </>
                    ) : (
                        <>
                            <Button icon="edit" onClick={() => this.onEdit()}>Edit</Button>
                            <Button type="danger" icon="delete"
                                    style={{marginLeft: "10px"}}
                                    onClick={() => this.onDelete()}>Delete</Button>
                        </>
                    )}
                </div>
                <Typography.Paragraph style={{maxWidth: "600px"}}>
                    {this.state.description}
                </Typography.Paragraph>

                <Typography.Title level={3}>Data Use</Typography.Title>
                <DataUseDisplay uses={this.state.data_use.data_use_requirements.map(d => d.code)} size="large" />

                <Typography.Title level={3} style={{marginTop: "1.2em"}}>
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
    value: PropTypes.object,
    datasets: PropTypes.arrayOf(PropTypes.object),
    loadingDatasets: PropTypes.bool,
    editing: PropTypes.bool,
    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
    onCancelEdit: PropTypes.func,
    onSave: PropTypes.func
};

export default Project;
