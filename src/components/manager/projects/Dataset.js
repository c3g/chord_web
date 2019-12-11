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

import DataUseDisplay from "../../DataUseDisplay";
import TableAdditionModal from "./TableAdditionModal";
import TableDeletionModal from "./TableDeletionModal";

import {
    addProjectTable,
    deleteProjectTableIfPossible,
    fetchProjectsWithDatasetsAndTables
} from "../../../modules/metadata/actions";

import {INITIAL_DATA_USE_VALUE} from "../../../duo";
import {simpleDeepCopy, projectPropTypesShape} from "../../../utils";


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
            identifier: value.identifier || null,
            title: value.title || "",
            description: value.description || "",
            data_use: simpleDeepCopy(value.data_use || INITIAL_DATA_USE_VALUE),
            tables: value.tables || [],

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
        const [serviceArtifact, dataTypeID] = values.dataType.split(":");
        const serviceInfo = this.props.serviceInfoByArtifact[serviceArtifact];
        await this.props.addProjectTable(this.props.project.identifier, this.state.identifier, serviceInfo, dataTypeID,
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
        await this.props.deleteProjectTable(this.props.project.identifier, this.state.selectedTable);

        await this.props.fetchProjectsWithDatasetsAndTables();  // TODO: If needed / only this project...

        this.setState({deletionModalVisible: false});
    }

    render() {
        const tableListColumns = [
            {title: "ID", dataIndex: "table_id"},
            {
                title: "Name",
                dataIndex: "name",
                render: n => (n ? n : NA_TEXT),
                defaultSortOrder: "ascend",
                sorter: (a, b) => (a.name && b.name) ? a.name.localeCompare(b.name) : a.id.localeCompare(b.id)
            },
            {title: "Data Type", dataIndex: "data_type"},
            {
                title: "actions",
                key: "actions",
                width: 330,
                render: t => (
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
                )
            }
        ];

        return (
            <Card key={this.state.identifier} title={this.state.title} extra={<>
                <Button icon="import" style={{marginRight: "24px"}}
                        onClick={() => this.onTableIngest(this.props.project, {
                            // Map dataset to metadata table  TODO: Remove all these hacks
                            id: this.state.identifier,
                            data_type: "phenopacket",  // TODO: Remove hard-coding...
                        })}>
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

                <Typography.Title level={4}>Data Use</Typography.Title>
                <DataUseDisplay dataUse={this.state.data_use} />

                <Typography.Title level={4}>Individuals and Pools</Typography.Title>
                <Typography.Paragraph>
                    Individuals can potentially be shared across many datasets.
                </Typography.Paragraph>

                <Table bordered
                       style={{marginBottom: "1rem"}}
                       dataSource={this.props.individuals.map(i => ({
                           ...i,
                           sex: i.sex || "UNKNOWN_SEX",
                           n_of_biosamples: (i.biosamples || []).length
                       }))}
                       rowKey="id"
                       loading={this.props.loadingIndividuals}
                       columns={[
                           {title: "Individual ID", dataIndex: "id"},
                           {title: "Date of Birth", dataIndex: "date_of_birth"},
                           {title: "Sex", dataIndex: "sex"},
                           {title: "# Biosamples", dataIndex: "n_of_biosamples"}  // TODO: Only relevant biosamples
                       ]}
                       expandedRowRender={i => {
                           return <div>
                               <Table columns={[{title: "Biosample ID", dataIndex: "id"}]}
                                         rowKey="id"
                                         dataSource={i.biosamples || []} />
                           </div>;
                       }}
                />

                <Typography.Title level={4}>
                    Tables
                    <div style={{float: "right"}}>
                        {(this.props.strayTables || []).length > 0 ? (
                            <Button icon="import" style={{verticalAlign: "top", marginRight: "10px"}}>
                                Adopt Stray Tables ({this.props.strayTables.length})
                            </Button>
                        ) : null}
                        <Button icon="plus" style={{verticalAlign: "top"}} type="primary"
                                onClick={() => this.handleAdditionClick()}>
                            Add Table
                        </Button>
                    </div>
                </Typography.Title>
                <Table bordered
                       dataSource={this.state.tables.map(t => ({...t, name: t.name || null}))}
                       rowKey="table_id"
                       expandedRowRender={() => (<span>TODO: List of files</span>)}
                       columns={tableListColumns}
                       loading={this.props.loadingTables} />
            </Card>
        );
    }
}

Dataset.propTypes = {
    project: projectPropTypesShape,
    strayTables: PropTypes.arrayOf(PropTypes.object),

    value: PropTypes.shape({
        identifier: PropTypes.string,
        title: PropTypes.string,
        tables: PropTypes.arrayOf(PropTypes.object),
    }),

    individuals: PropTypes.arrayOf(PropTypes.object),  // TODO: Get this via redux store instead of transformations

    loadingIndividuals: PropTypes.bool,
    loadingTables: PropTypes.bool,

    onTableIngest: PropTypes.func,

    serviceInfoByArtifact: PropTypes.object
};

const mapStateToProps = state => ({
    serviceInfoByArtifact: state.services.itemsByArtifact
});

const mapDispatchToProps = dispatch => ({
    addProjectTable: async (projectID, datasetID, serviceID, dataTypeID, tableName) =>
        await dispatch(addProjectTable(projectID, datasetID, serviceID, dataTypeID, tableName)),
    deleteProjectTable: async (projectID, table) => await dispatch(deleteProjectTableIfPossible(projectID, table)),
    fetchProjectsWithDatasetsAndTables: async () => dispatch(fetchProjectsWithDatasetsAndTables())
});

export default connect(mapStateToProps, mapDispatchToProps)(Dataset);
