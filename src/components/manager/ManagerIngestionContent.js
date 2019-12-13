import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import PropTypes from "prop-types";

import {Button, Empty, Form, Layout, List, Skeleton, Spin, Steps, Table, Tag, TreeSelect} from "antd";

import "antd/es/button/style/css";
import "antd/es/empty/style/css";
import "antd/es/form/style/css";
import "antd/es/layout/style/css";
import "antd/es/list/style/css";
import "antd/es/skeleton/style/css";
import "antd/es/spin/style/css";
import "antd/es/steps/style/css";
import "antd/es/table/style/css";
import "antd/es/tag/style/css";
import "antd/es/tree-select/style/css";

import WorkflowListItem from "./WorkflowListItem";

import {simpleDeepCopy} from "../../utils";

import {submitIngestionWorkflowRun} from "../../modules/wes/actions";

import {
    dropBoxTreeStateToPropsMixin,
    dropBoxTreeStateToPropsMixinPropTypes,

    workflowsStateToPropsMixin,
    workflowsStateToPropsMixinPropTypes
} from "../../utils";

import {
    FORM_LABEL_COL,
    FORM_WRAPPER_COL,
    FORM_BUTTON_COL
} from "./ingestion";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";
import IngestionInputForm from "./IngestionInputForm";

const STEP_WORKFLOW_SELECTION = 0;
const STEP_INPUT = 1;
const STEP_CONFIRM = 2;

class ManagerIngestionContent extends Component {
    constructor(props) {
        super(props);

        this.initialState = {
            step: STEP_WORKFLOW_SELECTION,
            selectedTable: null,
            selectedWorkflow: null,
            inputFormFields: {},
            inputs: {}
        };

        // TODO: Move selectedTable to redux?

        this.state = {
            ...simpleDeepCopy(this.initialState),
            selectedTable: (this.props.location.state || {}).selectedTable || this.initialState.selectedTable
        };

        this.handleStepChange = this.handleStepChange.bind(this);
        this.handleWorkflowClick = this.handleWorkflowClick.bind(this);
        this.handleInputSubmit = this.handleInputSubmit.bind(this);
        this.handleRunIngestion = this.handleRunIngestion.bind(this);
        this.getStepContents = this.getStepContents.bind(this);
    }

    handleStepChange(step) {
        this.setState({step});
    }

    handleWorkflowClick(workflow) {
        this.setState({
            step: STEP_INPUT,
            selectedWorkflow: workflow,
            inputFormFields: {},
            inputs: {}
        });
    }

    handleInputSubmit(inputs) {
        this.setState({
            inputs,
            step: STEP_CONFIRM
        });
    }

    async handleRunIngestion(history) {
        if (!this.state.selectedTable || !this.state.selectedWorkflow) {
            // TODO: GUI error message
            return;
        }

        const serviceInfo = this.props.servicesByID[this.state.selectedWorkflow.serviceID];
        const tableID = this.state.selectedTable.split(":")[2];

        await this.props.submitIngestionWorkflowRun(serviceInfo, tableID, this.state.selectedWorkflow,
            this.state.inputs, "/data/manager/runs", history);

        this.setState(simpleDeepCopy(this.initialState));
    }

    getStepContents() {
        const getTableName = (serviceID, dataTypeID, tableID) =>
            ((((this.props.tablesByServiceAndDataTypeID[serviceID] || {})[dataTypeID]
                || {}).tablesByID || {})[tableID] || {}).name;

        const formatWithNameIfPossible = (name, id) => name ? `${name} (${id})` : id;

        switch (this.state.step) {
            case STEP_WORKFLOW_SELECTION:
                // TODO: Loading projects

                const selectTreeData = this.props.projects.map(p => ({
                    title: p.title,
                    selectable: false,
                    key: `project:${p.identifier}`,
                    value: `project:${p.identifier}`,
                    children: p.datasets.map(d => ({
                        title: d.title,
                        selectable: false,
                        key: `dataset:${d.identifier}`,
                        value: `dataset:${d.identifier}`,
                        children: [
                            // Add the dataset metadata table in manually -- it's not "owned" per se
                            {
                                title: (
                                    <>
                                        {/*TODO: Don't hard-code data type name here, fetch from serviceTables*/}
                                        <Tag style={{marginRight: "1em"}}>phenopacket</Tag>
                                        {d.title} Metadata ({d.identifier})
                                    </>
                                ),
                                key: `${p.identifier}:phenopacket:${d.identifier}`,
                                value: `${p.identifier}:phenopacket:${d.identifier}`
                            },
                            ...(this.props.projectTables[p.identifier] || [])
                                .filter(t => t.dataset === d.identifier &&
                                    Object.keys(this.props.tablesByServiceAndDataTypeID).includes(t.service_id))
                                .map(t => ({
                                    title: (
                                        <>
                                            <Tag style={{marginRight: "1em"}}>{t.data_type}</Tag>
                                            {getTableName(t.service_id, t.data_type, t.table_id)
                                                ? `${getTableName(
                                                    t.service_id, t.data_type, t.table_id)} (${t.table_id})`
                                                : t.table_id}
                                        </>
                                    ),
                                    isLeaf: true,
                                    key: `${p.identifier}:${t.data_type}:${t.table_id}`,
                                    value: `${p.identifier}:${t.data_type}:${t.table_id}`
                                }))
                        ]
                    }))
                }));

                const workflows = this.props.workflows
                    .filter(w => w.data_types.includes(this.state.selectedTable
                        ? this.state.selectedTable.split(":")[1] : null))
                    .map(w => (
                        <List.Item key={w.id}>
                            <WorkflowListItem key={w.id} workflow={w} selectable={true}
                                              onClick={() => this.handleWorkflowClick(w)} />
                        </List.Item>
                    ));

                return (
                    <Form labelCol={FORM_LABEL_COL} wrapperCol={FORM_WRAPPER_COL}>
                        <Form.Item label="Table">
                            <Spin spinning={this.props.servicesLoading || this.props.projectsLoading}>
                                <TreeSelect onChange={table => this.setState({selectedTable: table})}
                                            loading={true}
                                            value={this.state.selectedTable} treeData={selectTreeData}
                                            treeDefaultExpandAll={true} />
                            </Spin>
                        </Form.Item>
                        <Form.Item label="Workflows">
                            {this.state.selectedTable
                                ? <Spin spinning={this.props.workflowsLoading}>
                                    {this.props.workflowsLoading
                                        ? <Skeleton/>
                                        : <List itemLayout="vertical">{workflows}</List>}
                                </Spin>
                                : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                                         description="Select a table to see available workflows" />
                            }
                        </Form.Item>
                    </Form>
                );

            case STEP_INPUT:
                return (
                    <IngestionInputForm workflow={this.state.selectedWorkflow} tree={this.props.tree}
                                        formValues={this.state.inputFormFields}
                                        onChange={formValues => this.setState({inputFormFields: formValues})}
                                        onSubmit={this.handleInputSubmit}
                                        onBack={() => this.handleStepChange(0)} />
                );

            case STEP_CONFIRM:
                const [projectID, dataType, tableID] = this.state.selectedTable.split(":");
                const projectTitle = (this.props.projectsByID[projectID] || {title: null}).title || null;
                const tableName = getTableName(this.state.selectedWorkflow.serviceID,
                    this.state.selectedWorkflow.data_types[0], tableID);

                return (
                    <Form labelCol={FORM_LABEL_COL} wrapperCol={FORM_WRAPPER_COL}>
                        <Form.Item label="Project">
                            {formatWithNameIfPossible(projectTitle, projectID)}
                        </Form.Item>
                        <Form.Item label="Data Type">
                            <Tag>{dataType}</Tag>
                        </Form.Item>
                        <Form.Item label="Table">
                            {formatWithNameIfPossible(tableName, tableID)}
                        </Form.Item>
                        <Form.Item label="Workflow">
                            <List itemLayout="vertical" style={{marginBottom: "14px"}}>
                                <List.Item>
                                    <WorkflowListItem workflow={this.state.selectedWorkflow} />
                                </List.Item>
                            </List>
                        </Form.Item>
                        <Form.Item label="Inputs">
                            <Table size="small" bordered={true} showHeader={false} pagination={false} columns={[
                                {title: "ID", dataIndex: "id", render: iID =>
                                        <span style={{fontWeight: "bold", marginRight: "0.5em"}}>{iID}</span>},
                                {title: "Value", dataIndex: "value", render: value =>
                                        value instanceof Array
                                            ? <ul>{value.map(v => <li key={v.toString()}>{v.toString()}</li>)}</ul>
                                            : value.toString()}
                            ]} rowKey="id" dataSource={this.state.selectedWorkflow.inputs.map(i =>
                                ({id: i.id, value: this.state.inputs[i.id]}))} />
                        </Form.Item>
                        <Form.Item wrapperCol={FORM_BUTTON_COL}>
                            {/* TODO: Back button like the last one */}
                            <Button type="primary" style={{marginTop: "16px", float: "right"}}
                                    loading={this.props.isSubmittingIngestionRun}
                                    onClick={() => this.handleRunIngestion(this.props.history)}>
                                Run Ingestion
                            </Button>
                        </Form.Item>
                    </Form>
                );
        }
    }

    render() {
        return (
            <Layout>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    <Steps current={this.state.step} onChange={this.handleStepChange}>
                        <Steps.Step title="Table & Workflow"
                                    description={<span style={{letterSpacing: "-0.1px"}}>
                                        Choose a table and ingestion workflow.
                                    </span>}>

                        </Steps.Step>
                        <Steps.Step title="Input"
                                    description="Select input data for the workflow."
                                    disabled={this.state.step < STEP_INPUT &&
                                        Object.keys(this.state.inputs).length === 0} />
                        <Steps.Step title="Run" description="Confirm details and run the workflow."
                                    disabled={this.state.step < STEP_CONFIRM && (this.state.selectedWorkflow === null ||
                                        Object.keys(this.state.inputs).length === 0)} />
                    </Steps>
                    <div style={{marginTop: "16px"}}>{this.getStepContents()}</div>
                </Layout.Content>
            </Layout>
        )
    }
}

ManagerIngestionContent.propTypes = {
    ...dropBoxTreeStateToPropsMixinPropTypes,
    ...workflowsStateToPropsMixinPropTypes,
    projects: PropTypes.array,
    projectsByID: PropTypes.object,  // TODO: Shape
    projectTables: PropTypes.object,  // TODO: Shape
    tablesByServiceAndDataTypeID: PropTypes.object,  // TODO: Shape
    isSubmittingIngestionRun: PropTypes.bool,

    projectsLoading: PropTypes.bool,

    servicesByID: PropTypes.object, // TODO: Shape
};

const mapStateToProps = state => ({
    ...dropBoxTreeStateToPropsMixin(state),
    ...workflowsStateToPropsMixin(state),
    projects: state.projects.items,
    projectsByID: state.projects.itemsByID,
    projectTables: state.projectTables.itemsByProjectID,
    tablesByServiceAndDataTypeID: state.serviceTables.itemsByServiceAndDataTypeID,
    isSubmittingIngestionRun: state.runs.isSubmittingIngestionRun,

    projectsLoading: state.projects.isFetching,

    servicesLoading: state.services.isFetchingAll,
    servicesByID: state.services.itemsByID,
});

const mapDispatchToProps = dispatch => ({
    submitIngestionWorkflowRun: async (sID, dID, workflow, inputs, redirect, history) =>
        await dispatch(submitIngestionWorkflowRun(sID, dID, workflow, inputs, redirect, history))
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ManagerIngestionContent));
