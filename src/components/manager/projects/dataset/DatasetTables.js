import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Col, Row, Table, Typography} from "antd";
import "antd/es/button/style/css";
import "antd/es/col/style/css";
import "antd/es/row/style/css";
import "antd/es/table/style/css";
import "antd/es/typography/style/css";

import {DeleteOutlined, ImportOutlined, PlusOutlined} from "@ant-design/icons";

import DatasetOverview from "./DatasetOverview";
import TableAdditionModal from "./table/TableAdditionModal";
import TableDeletionModal from "./table/TableDeletionModal";

import {
    addProjectTable,
    deleteProjectTableIfPossible,
    fetchProjectsWithDatasetsAndTables
} from "../../../../modules/metadata/actions";
import {datasetPropTypesShape, nop, projectPropTypesShape} from "../../../../utils";


const NA_TEXT = (<span style={{color: "#999", fontStyle: "italic"}}>N/A</span>);

class DatasetTables extends Component {
    constructor(props) {
        super(props);

        this.state = {
            additionModalVisible: false,
            deletionModalVisible: false,
            selectedTable: null,
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
        await this.props.addProjectTable(this.props.dataset.identifier, serviceInfo, dataTypeID, values.name);

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
        await this.props.deleteProjectTable(this.state.selectedTable);

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
            ...(this.props.isPrivate ? [
                {
                    title: "Actions",
                    key: "actions",
                    width: 230, /*330,*/
                    render: t => (
                        <Row gutter={10}>
                            <Col span={12}>
                                <Button icon={<ImportOutlined />}
                                        style={{width: "100%"}}
                                        onClick={() => (this.props.onTableIngest || nop)(this.props.project, t)}>
                                    Ingest
                                </Button>
                            </Col>
                            {/* TODO: Edit Table Name: v0.2 */}
                            {/*<Col span={8}><Button icon="edit" style={{width: "100%"}}>Edit</Button></Col>*/}
                            <Col span={12}><Button type="danger"
                                                   icon={<DeleteOutlined />}
                                                   onClick={() => this.handleTableDeletionClick(t)}
                                                   style={{width: "100%"}}>Delete</Button></Col>
                        </Row>
                    )
                }
            ] : [])
        ];

        const dataset = this.props.dataset || {};
        return (
            <>
                <Typography.Title level={4}>
                    Tables
                    {this.props.isPrivate ? (
                        <div style={{float: "right"}}>
                            {/* TODO: Implement v0.2
                                {(this.props.strayTables || []).length > 0 ? (
                                    <Button icon="import" style={{verticalAlign: "top", marginRight: "10px"}}>
                                        Adopt Stray Tables ({this.props.strayTables.length})
                                    </Button>
                                ) : null} */}
                            <Button icon={<PlusOutlined />}
                                    style={{verticalAlign: "top"}}
                                    type="primary"
                                    onClick={() => this.handleAdditionClick()}>
                                Add Table
                            </Button>
                        </div>
                    ) : null}
                </Typography.Title>

                <Table bordered
                       dataSource={(dataset.tables || []).map(t => ({...t, name: t.name || null}))}
                       rowKey="table_id"
                       // expandedRowRender={() => (<span>TODO: List of files</span>)} TODO: Implement v0.2
                       columns={tableListColumns}
                       loading={this.props.isFetchingTables} />

                <TableAdditionModal visible={this.state.additionModalVisible}
                                    project={this.props.project}
                                    dataset={dataset}
                                    onSubmit={vs => this.handleAdditionSubmit(vs)}
                                    onCancel={() => this.handleAdditionCancel()} />

                <TableDeletionModal visible={this.state.deletionModalVisible}
                                    table={dataset}
                                    onSubmit={() => this.handleTableDeletionSubmit()}
                                    onCancel={() => this.handleTableDeletionCancel()} />
            </>
        );
    }
}

DatasetOverview.propTypes = {
    isPrivate: PropTypes.bool,
    project: projectPropTypesShape,
    dataset: datasetPropTypesShape,
    onTableIngest: PropTypes.func,
    isFetchingTables: PropTypes.bool,

    serviceInfoByArtifact: PropTypes.object,

    addProjectTable: PropTypes.func,
    deleteProjectTable: PropTypes.func,
    fetchProjectsWithDatasetsAndTables: PropTypes.func,
};

const mapStateToProps = state => ({
    serviceInfoByArtifact: state.services.itemsByArtifact,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    addProjectTable: async (datasetID, serviceID, dataTypeID, tableName) =>
        await dispatch(addProjectTable(ownProps.project, datasetID, serviceID, dataTypeID, tableName)),
    deleteProjectTable: async table => await dispatch(deleteProjectTableIfPossible(ownProps.project, table)),
    fetchProjectsWithDatasetsAndTables: async () => await dispatch(fetchProjectsWithDatasetsAndTables()),
});

export default connect(mapStateToProps, mapDispatchToProps)(DatasetTables);
