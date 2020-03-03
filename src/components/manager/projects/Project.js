import React, {Component} from "react";
import PropTypes from "prop-types";

import {Button, Col, Empty, Row, Typography} from "antd";
import "antd/es/button/style/css";
import "antd/es/col/style/css";
import "antd/es/empty/style/css";
import "antd/es/row/style/css";
import "antd/es/typography/style/css";

import {CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined} from "@ant-design/icons";

import Dataset from "./dataset/Dataset";
import ProjectForm from "./ProjectForm";

import {INITIAL_DATA_USE_VALUE} from "../../../duo";
import {nop, simpleDeepCopy, projectPropTypesShape} from "../../../utils";


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

        this._onCancelEdit = props.onCancelEdit || nop;
        this._onSave = props.onSave || nop;

        this.editingForm = null;

        this.handleCancelEdit = this.handleCancelEdit.bind(this);
        this.handleSave = this.handleSave.bind(this);

        const value = props.value || {};
        this.state = {
            identifier: value.identifier || null,
            title: value.title || "",
            description: value.description || "",
            datasets: value.datasets || [],
        }
    }

    handleSave() {
        this.editingForm.validateFields((err, values) => {
            if (err) {
                console.error(err);
                return;
            }

            // Don't save datasets since it's a related set.
            this._onSave({
                identifier: this.state.identifier,
                title: values.title || this.state.title,
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
                            <Button type="primary"
                                    icon={<CheckOutlined />}
                                    loading={this.props.saving}
                                    onClick={() => this.handleSave()}>Save</Button>
                            <Button icon={<CloseOutlined />}
                                    style={{marginLeft: "10px"}}
                                    disabled={this.props.saving}
                                    onClick={() => this.handleCancelEdit()}>Cancel</Button>
                        </>
                    ) : (
                        <>
                            <Button icon={<EditOutlined />} onClick={() => (this.props.onEdit || nop)()}>Edit</Button>
                            <Button type="danger" icon={<DeleteOutlined />}
                                    style={{marginLeft: "10px"}}
                                    onClick={() => (this.props.onDelete || nop)()}>Delete</Button>
                        </>
                    )}
                </div>
                {this.props.editing ? (
                    <ProjectForm style={{maxWidth: "600px"}}
                                 initialValue={{
                                     title: this.state.title,
                                     description: this.state.description,
                                     data_use: this.state.data_use
                                 }}
                                 ref={form => this.editingForm = form} />
                ) : (
                    <>
                        <Typography.Title level={2}>
                            {this.state.title}
                        </Typography.Title>
                        {this.state.description.split("\n").map((p, i) =>
                            <Typography.Paragraph key={i} style={{maxWidth: "600px"}}>{p}</Typography.Paragraph>)}
                    </>
                )}

                <Typography.Title level={3} style={{marginTop: "1.2em"}}>
                    Datasets
                    <div style={{float: "right"}}>
                        <Button icon={<PlusOutlined />}
                                style={{verticalAlign: "top"}}
                                onClick={() => (this.props.onAddDataset || nop)()}>
                            Add Dataset
                        </Button>
                    </div>
                </Typography.Title>
                {(this.state.datasets || []).length > 0
                    ? this.state.datasets.sort((d1, d2) => d1.title.localeCompare(d2.title)).map(d =>
                        <Row gutter={[0, 16]} key={d.identifier}>
                            <Col span={24}>
                                <Dataset key={d.identifier}
                                         mode="private"
                                         project={this.props.value}
                                         value={{
                                             ...d,
                                             tables: this.props.tables.filter(t => t.dataset === d.identifier),
                                         }}
                                         strayTables={this.props.strayTables}
                                         individuals={this.props.individuals.filter(i =>
                                             i.phenopackets.map(p => p.dataset).includes(d.identifier))}
                                         loadingIndividuals={this.props.loadingIndividuals}
                                         onEdit={() => (this.props.onEditDataset || nop)(d)}
                                         onTableIngest={this.props.onTableIngest || nop}  />
                            </Col>
                        </Row>
                    ) : (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Datasets">
                            <Button icon={<PlusOutlined />} onClick={() => (this.props.onAddDataset || nop)()}>Add Dataset</Button>
                        </Empty>
                    )}
            </div>
        );
    }
}

Project.propTypes = {
    value: projectPropTypesShape,
    tables: PropTypes.arrayOf(PropTypes.object),  // TODO: shape
    strayTables: PropTypes.arrayOf(PropTypes.object),  // TODO: shape (this is currently heterogeneous)

    editing: PropTypes.bool,
    saving: PropTypes.bool,

    individuals: PropTypes.arrayOf(PropTypes.object),  // TODO: shape
    loadingIndividuals: PropTypes.bool,

    onDelete: PropTypes.func,
    onEdit: PropTypes.func,
    onCancelEdit: PropTypes.func,
    onSave: PropTypes.func,
    onAddDataset: PropTypes.func,
    onEditDataset: PropTypes.func,

    onTableIngest: PropTypes.func
};

export default Project;
