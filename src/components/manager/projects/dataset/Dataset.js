import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Button, Card, Col, Divider, Empty, Icon, Modal, Row, Table, Typography} from "antd";
import "antd/es/button/style/css";
import "antd/es/card/style/css";
import "antd/es/col/style/css";
import "antd/es/divider/style/css";
import "antd/es/empty/style/css";
import "antd/es/icon/style/css";
import "antd/es/modal/style/css";
import "antd/es/row/style/css";
import "antd/es/table/style/css";
import "antd/es/typography/style/css";

import DataUseDisplay from "../../../DataUseDisplay";

import {
    deleteProjectDatasetIfPossible,
    deleteDatasetLinkedFieldSetIfPossible,
} from "../../../../modules/metadata/actions";

import {INITIAL_DATA_USE_VALUE} from "../../../../duo";
import {
    simpleDeepCopy,
    projectPropTypesShape,
    datasetPropTypesShape,
    nop,
    FORM_MODE_EDIT,
    FORM_MODE_ADD
} from "../../../../utils";
import LinkedFieldSetTable from "./linked_field_set/LinkedFieldSetTable";
import LinkedFieldSetModal from "./linked_field_set/LinkedFieldSetModal";
import DatasetOverview from "./DatasetOverview";
import DatasetTables from "./DatasetTables";


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

        const value = props.value || {};
        this.state = {  // TODO: For editing
            identifier: value.identifier || null,
            title: value.title || "",
            description: value.description || "",
            contact_info: value.contact_info || "",
            data_use: simpleDeepCopy(value.data_use || INITIAL_DATA_USE_VALUE),
            linked_field_sets: value.linked_field_sets || [],
            tables: value.tables || [],

            fieldSetAdditionModalVisible: false,

            fieldSetEditModalVisible: false,
            selectedLinkedFieldSet: {
                data: null,
                index: null
            },

            selectedTab: "overview",
            selectedTable: null,
        };

        this.handleFieldSetDeletion = this.handleFieldSetDeletion.bind(this);
    }


    handleFieldSetDeletion(fieldSet, index) {
        const deleteModal = Modal.confirm({
            title: `Are you sure you want to delete the "${fieldSet.name}" linked field set?`,
            content: <>
                <Typography.Paragraph>
                    Doing so will mean users will <strong>no longer</strong> be able to link
                    search results across the data types specified via the following
                    linked fields:
                </Typography.Paragraph>
                <LinkedFieldSetTable linkedFieldSet={fieldSet} inModal={true} />
            </>,
            width: 720,
            autoFocusButton: "cancel",
            okText: "Delete",
            okType: "danger",
            maskClosable: true,
            onOk: async () => {
                deleteModal.update({okButtonProps: {loading: true}});
                await this.props.deleteLinkedFieldSet(this.state, fieldSet, index);
                deleteModal.update({okButtonProps: {loading: false}});
            },
        });
    }

    render() {
        const isPrivate = this.props.mode === "private";

        const tabContents = {
            overview: <DatasetOverview dataset={this.state}
                                       project={this.props.project}
                                       isPrivate={isPrivate}
                                       isFetchingTables={this.props.isFetchingTables} />,
            ...(isPrivate ? {
                individuals: (
                    <>
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
                                   // TODO: Only relevant biosamples
                                   {title: "# Biosamples", dataIndex: "n_of_biosamples"}
                               ]}
                               expandedRowRender={i => (
                                   <div>
                                       <Table columns={[{title: "Biosample ID", dataIndex: "id"}]}
                                              rowKey="id"
                                              dataSource={i.biosamples || []} />
                                   </div>
                               )}
                        />
                    </>
                ),
            } : {}),
            tables: <DatasetTables dataset={this.state}
                                   project={this.props.project}
                                   isPrivate={isPrivate}
                                   isFetchingTables={this.props.isFetchingTables}
                                   onTableIngest={this.props.onTableIngest || nop} />,
            linked_field_sets: (
                <>
                    <Typography.Title level={4}>
                        Linked Field Sets
                        {isPrivate ? (
                            <div style={{float: "right"}}>
                                <Button icon="plus"
                                        style={{verticalAlign: "top"}}
                                        type="primary"
                                        onClick={() => this.setState({fieldSetAdditionModalVisible: true})}>
                                    Add Linked Field Set
                                </Button>
                            </div>
                        ) : null}
                    </Typography.Title>
                    <Typography.Paragraph style={{maxWidth: "600px"}}>
                        Linked Field Sets group common fields (i.e. fields that share the same "value space") between
                        multiple data types. For example, these sets can be used to tell the discovery system that
                        Phenopacket biosample identifiers are the same as variant call sample identifiers, and so
                        variant calls with an identifier of "sample1" come from a biosample with identifier "sample1".
                    </Typography.Paragraph>
                    <Typography.Paragraph style={{maxWidth: "600px"}}>
                        A word of caution: the more fields added to a Linked Field Set, the longer it takes to search
                        the dataset in question.
                    </Typography.Paragraph>
                    {(this.state.linked_field_sets || {}).length === 0
                        ? (
                            <>
                                <Divider />
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Field Link Sets">
                                    {isPrivate ? (
                                        <Button icon="plus"
                                                type="primary"
                                                onClick={() =>
                                                    this.setState({fieldSetAdditionModalVisible: true})}>
                                            Add Field Link Set
                                        </Button>
                                    ) : null}
                                </Empty>
                            </>
                        ) : (
                            <Row gutter={[16, 24]}>
                                {(this.state.linked_field_sets || []).map((fieldSet, i) => (
                                    <Col key={i} lg={24} xl={12}>
                                        <Card title={`${i+1}. ${fieldSet.name}`} actions={isPrivate ? [
                                            <span onClick={() => this.setState({
                                                fieldSetEditModalVisible: true,
                                                selectedLinkedFieldSet: {
                                                    data: fieldSet,
                                                    index: i
                                                }
                                            })}>
                                                <Icon type="edit"
                                                      style={{width: "auto", display: "inline"}}
                                                      key="edit_field_sets" /> Manage Fields</span>,
                                            <span onClick={() => this.handleFieldSetDeletion(fieldSet, i)}>
                                                <Icon type="delete"
                                                      style={{width: "auto", display: "inline"}}
                                                      key="delete_field_set" /> Delete Set</span>,
                                        ] : []}>
                                            <LinkedFieldSetTable linkedFieldSet={fieldSet} />
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        )}
                </>
            ),
            data_use: <DataUseDisplay dataUse={this.state.data_use} />
        };

        return (
            <Card key={this.state.identifier} title={this.state.title} tabList={[
                {key: "overview", tab: "Overview"},
                ...(isPrivate ? [{key: "individuals", tab: "Individuals and Pools"}] : []),
                {key: "tables", tab: "Data Tables"},
                {key: "linked_field_sets", tab: "Linked Field Sets"},
                {key: "data_use", tab: "Consent Codes and Data Use"},
            ]} activeTabKey={this.state.selectedTab} onTabChange={t => this.setState({selectedTab: t})} extra={
                isPrivate ? (
                    <>
                        <Button icon="import" style={{marginRight: "16px"}}
                                onClick={() => (this.props.onTableIngest || nop)(this.props.project, {
                                    // Map dataset to metadata table  TODO: Remove all these hacks
                                    id: this.state.identifier,
                                    data_type: "phenopacket",  // TODO: Remove hard-coding...
                                })}>
                            Ingest Metadata
                        </Button>
                        <Button icon="edit"
                                style={{marginRight: "8px"}}
                                onClick={() => (this.props.onEdit || nop)()}>Edit</Button>
                        <Button type="danger" icon="delete" onClick={() => {
                            const deleteModal = Modal.confirm({
                                title: `Are you sure you want to delete the "${this.state.title}" dataset?`,
                                content: <>
                                    <Typography.Paragraph>
                                        All data contained in the dataset will be deleted permanently, and the dataset
                                        will no longer be available for discovery within the CHORD federation.
                                        {/* TODO: Real terms and conditions */}
                                    </Typography.Paragraph>
                                </>,
                                width: 572,
                                autoFocusButton: "cancel",
                                okText: "Delete",
                                okType: "danger",
                                maskClosable: true,
                                onOk: async () => {
                                    deleteModal.update({okButtonProps: {loading: true}});
                                    await this.props.deleteProjectDataset(this.state);
                                    deleteModal.update({okButtonProps: {loading: false}});
                                },
                            });
                        }}>Delete</Button>
                        {/* TODO: Share button (vFuture) */}
                    </>
                ) : null
            }>
                {isPrivate ? (
                    <>
                        <LinkedFieldSetModal mode={FORM_MODE_ADD}
                                             dataset={this.state}
                                             visible={this.state.fieldSetAdditionModalVisible}
                                             onSubmit={() => this.setState({fieldSetAdditionModalVisible: false})}
                                             onCancel={() =>
                                                         this.setState({fieldSetAdditionModalVisible: false})} />

                        <LinkedFieldSetModal mode={FORM_MODE_EDIT}
                                             dataset={this.state}
                                             visible={this.state.fieldSetEditModalVisible}
                                             linkedFieldSet={this.state.selectedLinkedFieldSet.data}
                                             linkedFieldSetIndex={this.state.selectedLinkedFieldSet.index}
                                             onSubmit={() => this.setState({fieldSetEditModalVisible: false})}
                                             onCancel={() => this.setState({fieldSetEditModalVisible: false})} />
                    </>
                ) : null}
                {tabContents[this.state.selectedTab]}
            </Card>
        );
    }
}

Dataset.propTypes = {
    // Is the dataset being viewed in the context of the data manager or via discovery?
    mode: PropTypes.oneOf(["public", "private"]),

    project: projectPropTypesShape,
    strayTables: PropTypes.arrayOf(PropTypes.object),

    value: datasetPropTypesShape,

    // TODO: Shape
    individuals: PropTypes.arrayOf(PropTypes.object),  // TODO: Get this via redux store instead of transformations

    loadingIndividuals: PropTypes.bool,
    isFetchingTables: PropTypes.bool,

    onEdit: PropTypes.func,
    onTableIngest: PropTypes.func,
};

const mapStateToProps = state => ({
    isFetchingTables: state.services.isFetchingAll
        || state.projectTables.isFetching
        || state.projects.isFetchingWithTables,  // TODO: Hiccup
    isSavingDataset: state.projects.isSavingDataset,
    isDeletingDataset: state.projects.isDeletingDataset,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    deleteProjectDataset: async dataset => await dispatch(deleteProjectDatasetIfPossible(ownProps.project, dataset)),
    deleteLinkedFieldSet: async (dataset, linkedFieldSet, linkedFieldSetIndex) =>
        await dispatch(deleteDatasetLinkedFieldSetIfPossible(dataset, linkedFieldSet, linkedFieldSetIndex)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dataset);
