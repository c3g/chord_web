import React, {Component} from "react";
import PropTypes from "prop-types";

import {Button, Card, Col, Row, Spin, Table, Typography} from "antd";

import "antd/es/button/style/css";
import "antd/es/card/style/css";
import "antd/es/col/style/css";
import "antd/es/row/style/css";
import "antd/es/spin/style/css";
import "antd/es/table/style/css";
import "antd/es/typography/style/css";

import DataUseDisplay from "../../DataUseDisplay";
import ProjectForm from "./ProjectForm";

import {INITIAL_DATA_USE_VALUE} from "../../../duo";
import {simpleDeepCopy} from "../../../utils";


const NA_TEXT = (<span style={{color: "#999", fontStyle: "italic"}}>N/A</span>);

class Project extends Component {
    static getDerivedStateFromProps(nextProps) {
        // TODO: Want to warn the user if the description has changed and they're editing...
        if ("value" in nextProps) {
            return {
                ...(nextProps.value || {}),
                data_use: simpleDeepCopy((nextProps.value || {}).data_use || INITIAL_DATA_USE_VALUE)
            };
        }
        return null;
    }

    handleCancelEdit() {
        this._onCancelEdit();
    }

    constructor(props) {
        super(props);

        const nop = () => {};

        this.onDelete = props.onDelete || nop;
        this.onEdit = props.onEdit || nop;
        this._onCancelEdit = props.onCancelEdit || nop;
        this._onSave = props.onSave || nop;
        this.onAddDataset = props.onAddDataset || nop;

        this.onDatasetIngest = props.onDatasetIngest || nop;

        this.editingForm = null;

        this.handleCancelEdit = this.handleCancelEdit.bind(this);
        this.handleSave = this.handleSave.bind(this);

        const value = props.value || {};
        this.state = {
            id: value.id || null,
            name: value.name || "",
            description: value.description || "",
            data_use: simpleDeepCopy(value.data_use || INITIAL_DATA_USE_VALUE)
        }
    }

    handleSave() {
        this.editingForm.validateFields((err, values) => {
            if (err) {
                console.error(err);
                return;
            }

            this._onSave({
                id: this.state.id,
                name: values.name || this.state.name,
                description: values.description || this.state.description,
                data_use: values.data_use || this.state.data_use
            });
        })
    }

    render() {
        return (
            <div>
                <div style={{position: "absolute", top: "24px", right: "24px"}}>
                    {this.props.editing ? (
                        <>
                            <Button type="primary" icon="check" loading={this.props.saving}
                                    onClick={() => this.handleSave()}>Save</Button>
                            <Button icon="close"
                                    style={{marginLeft: "10px"}}
                                    disabled={this.props.saving}
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
                {this.props.editing ? (
                    <ProjectForm style={{maxWidth: "600px"}}
                                 initialValue={{
                                     name: this.state.name,
                                     description: this.state.description,
                                     data_use: this.state.data_use
                                 }}
                                 ref={form => this.editingForm = form} />
                ) : (
                    <>
                        <Typography.Title level={2}>
                            {this.state.name}
                        </Typography.Title>
                        <Typography.Paragraph style={{maxWidth: "600px"}}>
                            {this.state.description}
                        </Typography.Paragraph>
                        <Typography.Title level={3}>Data Use</Typography.Title>
                        <DataUseDisplay dataUse={this.state.data_use} />
                    </>
                )}

                <Typography.Title level={3} style={{marginTop: "1.2em"}}>
                    Datasets
                    <div style={{float: "right"}}>
                        <Button icon="plus" style={{verticalAlign: "top"}} onClick={() => this.onAddDataset()}>
                            Add Dataset
                        </Button>
                    </div>
                </Typography.Title>
                <Spin spinning={this.props.loadingDatasets}>
                    <Card title="TODO DATASET" extra={<>
                        <Button icon="import" style={{marginRight: "24px"}}>
                            Ingest Metadata
                        </Button>
                        <Button icon="edit" style={{marginRight: "10px"}}>Edit</Button>
                        <Button type="danger" icon="delete">Delete</Button>
                    </>}>
                        <Typography.Title level={4}>Individuals and Samples</Typography.Title>
                        TODO

                        <Typography.Title level={4}>
                            Tables
                            <div style={{float: "right"}}>
                                <Button icon="plus" style={{verticalAlign: "top"}} onClick={() => this.onAddDataset()}>
                                    Add Table
                                </Button>
                            </div>
                        </Typography.Title>
                        <Table bordered dataSource={this.props.datasets.map(d => ({...d, name: d.name || null}))}
                               rowKey="id" expandedRowRender={() => (<span>TODO: List of files</span>)}>
                            <Table.Column dataIndex="id" title="ID" /> {/* TODO: Dataset name */}
                            <Table.Column dataIndex="name" title="Name" render={n => (n ? n : NA_TEXT)} />
                            <Table.Column dataIndex="dataTypeID" title="Data Type" />
                            <Table.Column key="actions" title="Actions" width={330} render={d => (
                                <Row gutter={10}>
                                    <Col span={8}><Button icon="import" style={{width: "100%"}}
                                                          onClick={() => this.onDatasetIngest(d)}>Ingest</Button></Col>
                                    {/*<Col span={8}><Button icon="team" style={{width: "100%"}}>Share</Button></Col>*/}
                                    <Col span={8}><Button icon="edit" style={{width: "100%"}}>Edit</Button></Col>
                                    <Col span={8}><Button type="danger" icon="delete"
                                                          style={{width: "100%"}}>Delete</Button></Col>
                                </Row>
                            )} />
                        </Table>
                    </Card>
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
    saving: PropTypes.bool,

    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
    onCancelEdit: PropTypes.func,
    onSave: PropTypes.func,
    onAddDataset: PropTypes.func,

    onDatasetIngest: PropTypes.func
};

export default Project;
