import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Card, Col, Row, Table, Typography} from "antd";
import "antd/es/button/style/css";
import "antd/es/card/style/css";
import "antd/es/col/style/css";
import "antd/es/row/style/css";
import "antd/es/table/style/css";
import "antd/es/typography/style/css";

import TableAdditionModal from "./TableAdditionModal";
import TableDeletionModal from "./TableDeletionModal";

import {
    addProjectTable,
    deleteProjectTableIfPossible,
    fetchProjectsWithDatasetsAndTables
} from "../../../modules/metadata/actions";

import {projectPropTypesShape} from "../../../utils";


const NA_TEXT = (<span style={{color: "#999", fontStyle: "italic"}}>N/A</span>);

class Dataset extends Component {
    // TODO: Editing

    static getDerivedStateFromProps(nextProps) {
        if ("value" in nextProps) {
            return {...(nextProps.value || {})};  // TODO: For editing
        }
        return null;
    }

    constructor(props) {
        super(props);

        this.onTableIngest = props.onTableIngest || (() => {});

        const value = props.value || {};
        this.state = {  // TODO: For editing
            dataset_id: value.dataset_id || null,
            name: value.name || "",
            description: value.description || "",
            tables: value.tables || [],
            loadingTables: value.loadingTables || false,

            additionModalVisible: false,
            deletionModalVisible: false,
            selectedTable: null
        };

        this.handleAdditionClick = this.handleAdditionClick.bind(this);
        this.handleAdditionCancel = this.handleAdditionCancel.bind(this);
        this.handleAdditionSubmit = this.handleAdditionSubmit.bind(this);

        this.handleTableDeletionClick = this.handleTableDeletionClick.bind(this);
        this.handleTableDeletionCancel = this.handleTableDeletionCancel.bind(this);
        this.handleTableDeletionSubmit = this.handleTableDeletionSubmit.bind(this);

    }

    handleAdditionClick() {
        this.setState({additionModalVisible: true});
    }

    handleAdditionCancel() {
        this.setState({additionModalVisible: false});
    }

    async handleAdditionSubmit(values) {
        const [serviceID, dataTypeID] = values.dataType.split(":");
        await this.props.addProjectTable(this.props.project.project_id, this.state.dataset_id, serviceID, dataTypeID,
            values.name);

        await this.props.fetchProjectsWithDatasetsAndTables();  // TODO: If needed / only this project...

        this.setState({additionModalVisible: false});
    }

    handleTableDeletionClick(t) {
        this.setState({deletionModalVisible: true, selectedTable: t});
    }

    handleTableDeletionCancel() {
        this.setState({deletionModalVisible: false});
    }

    async handleTableDeletionSubmit() {
        if (this.state.selectedTable === null) return;
        await this.props.deleteProjectTable(this.props.project.project_id, this.state.selectedTable);

        await this.props.fetchProjectsWithDatasetsAndTables();  // TODO: If needed / only this project...

        this.setState({deletionModalVisible: false});
    }

    render() {
        return (
            <Card key={this.state.dataset_id} title={this.state.name} extra={<>
                <Button icon="import" style={{marginRight: "24px"}}>
                    Ingest Metadata
                </Button>
                <Button icon="edit" style={{marginRight: "10px"}}>Edit</Button>
                <Button type="danger" icon="delete">Delete</Button>
                {/* TODO: Share button */}
            </>}>
                <TableAdditionModal visible={this.state.additionModalVisible}
                                    project={this.props.project}
                                    dataset={this.state}
                                    onSubmit={vs => this.handleAdditionSubmit(vs)}
                                    onCancel={() => this.handleAdditionCancel()} />

                <TableDeletionModal visible={this.state.deletionModalVisible}
                                    table={this.state.selectedTable}
                                    onSubmit={() => this.handleTableDeletionSubmit()}
                                    onCancel={() => this.handleTableDeletionCancel()} />

                {this.state.description.length > 0 ? (
                    <Typography.Paragraph>{this.state.description}</Typography.Paragraph>
                ) : null}

                <Typography.Title level={4}>Individuals and Pools</Typography.Title>
                TODO

                <Typography.Title level={4}>
                    Tables
                    <div style={{float: "right"}}>
                        <Button icon="plus" style={{verticalAlign: "top"}} onClick={() => this.handleAdditionClick()}>
                            Add Table
                        </Button>
                    </div>
                </Typography.Title>
                <Table bordered dataSource={this.state.tables.map(t => ({...t, name: t.name || null}))}
                       rowKey="table_id" expandedRowRender={() => (<span>TODO: List of files</span>)}
                       loading={this.state.loadingTables}>
                    <Table.Column dataIndex="table_id" title="ID" />
                    <Table.Column dataIndex="name" title="Name" render={n => (n ? n : NA_TEXT)} />
                    <Table.Column dataIndex="data_type" title="Data Type" />
                    <Table.Column key="actions" title="Actions" width={330} render={t => (
                        <Row gutter={10}>
                            <Col span={8}>
                                <Button icon="import" style={{width: "100%"}}
                                        onClick={() => this.onTableIngest(this.props.project, t)}>Ingest</Button>
                            </Col>
                            <Col span={8}><Button icon="edit" style={{width: "100%"}}>Edit</Button></Col>
                            <Col span={8}><Button type="danger" icon="delete"
                                                  onClick={() => this.handleTableDeletionClick(t)}
                                                  style={{width: "100%"}}>Delete</Button></Col>
                        </Row>
                    )} />
                </Table>
            </Card>
        );
    }
}

Dataset.propTypes = {
    project: projectPropTypesShape,

    value: PropTypes.shape({
        dataset_id: PropTypes.string,
        name: PropTypes.string,
        tables: PropTypes.arrayOf(PropTypes.object),
        loadingTables: PropTypes.bool
    }),

    onTableIngest: PropTypes.func
};

const mapDispatchToProps = dispatch => ({
    addProjectTable: async (projectID, datasetID, serviceID, dataTypeID, datasetName) =>
        await dispatch(addProjectTable(projectID, datasetID, serviceID, dataTypeID, datasetName)),
    deleteProjectTable: async (projectID, table) => await dispatch(deleteProjectTableIfPossible(projectID, table)),
    fetchProjectsWithDatasetsAndTables: async () => dispatch(fetchProjectsWithDatasetsAndTables())
});

export default connect(null, mapDispatchToProps)(Dataset);
