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

        const tableID = this.state.selectedTable.split(":")[2];

        await this.props.submitIngestionWorkflowRun(this.state.selectedWorkflow.serviceID, tableID,
            this.state.selectedWorkflow, this.state.inputs, "/data/manager/runs", history);

        this.setState(simpleDeepCopy(this.initialState));
    }

    render() {
        const getTableName = (serviceID, dataTypeID, tableID) =>
            ((((this.props.tablesByServiceAndDataTypeID[serviceID] || {})[dataTypeID]
                || {}).tablesByID || {})[tableID] || {}).name;

        let stepContents = null;
        switch (this.state.step) {
            case STEP_WORKFLOW_SELECTION:
                // TODO: Loading projects

                const selectTreeData = this.props.projects.map(p => ({
                    title: p.name,
                    selectable: false,
                    key: `project:${p.project_id}`,
                    value: `project:${p.project_id}`,
                    children: (this.props.projectDatasets[p.project_id] || []).map(d => ({
                        title: d.name,
                        selectable: false,
                        key: `dataset:${d.dataset_id}`,
                        value: `dataset:${d.dataset_id}`,
                        children: [
                            // Add the dataset metadata table in manually -- it's not "owned" per se
                            {
                                title: (
                                    <>
                                        {/*TODO: Don't hard-code data type name here, fetch from serviceTables*/}
                                        <Tag style={{marginRight: "1em"}}>phenopacket</Tag>
                                        {d.name} Metadata
                                    </>
                                ),
                                key: `${p.project_id}:phenopacket:${d.dataset_id}`,
                                value: `${p.project_id}:phenopacket:${d.dataset_id}`
                            },
                            ...(this.props.projectTables[p.project_id] || [])
                                .filter(t => t.dataset === d.dataset_id &&
                                    Object.keys(this.props.tablesByServiceAndDataTypeID).includes(t.service_id))
                                .map(t => ({
                                    title: (
                                        <>
                                            <Tag style={{marginRight: "1em"}}>{t.data_type}</Tag>
                                            {getTableName(t.service_id, t.data_type, t.table_id)
                                                ? `${getTableName(t.service_id, t.data_type, t.table_id)} (${t.table_id})`
                                                : t.table_id}
                                        </>
                                    ),
                                    isLeaf: true,
                                    key: `${p.project_id}:${t.data_type}:${t.table_id}`,
                                    value: `${p.project_id}:${t.data_type}:${t.table_id}`
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

                stepContents = (
                    <Form labelCol={FORM_LABEL_COL} wrapperCol={FORM_WRAPPER_COL}>
                        <Form.Item label="Table">
                            <TreeSelect onChange={table => this.setState({selectedTable: table})}
                                        value={this.state.selectedTable} treeData={selectTreeData}
                                        treeDefaultExpandAll={true} />
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

                break;

            case STEP_INPUT:
                stepContents = (
                    <IngestionInputForm workflow={this.state.selectedWorkflow} tree={this.props.tree}
                                        formValues={this.state.inputFormFields}
                                        onChange={formValues => this.setState({inputFormFields: formValues})}
                                        onSubmit={this.handleInputSubmit}
                                        onBack={() => this.handleStepChange(0)} />
                    );
                break;

            case STEP_CONFIRM:
                const [projectID, dataType, tableID] = this.state.selectedTable.split(":");
                const projectName = (this.props.projectsByID[projectID] || {name: null}).name || null;
                const tableName = getTableName(this.state.selectedWorkflow.serviceID,
                    this.state.selectedWorkflow.data_types[0], tableID);
                stepContents = (
                    <Form labelCol={FORM_LABEL_COL} wrapperCol={FORM_WRAPPER_COL}>
                        <Form.Item label="Project">
                            {projectName ? `${projectName} (${projectID})` : projectID}
                        </Form.Item>
                        <Form.Item label="Data Type">
                            <Tag>{dataType}</Tag>
                        </Form.Item>
                        <Form.Item label="Table">
                            {tableName ? `${tableName} (${tableID})` : tableID}
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
                                {title: "Value", dataIndex: "value"}
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
                break;
        }

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
                    <div style={{marginTop: "16px"}}>{stepContents}</div>
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
    isSubmittingIngestionRun: PropTypes.bool
};

const mapStateToProps = state => ({
    ...dropBoxTreeStateToPropsMixin(state),
    ...workflowsStateToPropsMixin(state),
    projects: state.projects.items,
    projectsByID: state.projects.itemsByID,
    projectDatasets: state.projectDatasets.itemsByProjectID,
    projectTables: state.projectTables.itemsByProjectID,
    tablesByServiceAndDataTypeID: state.serviceTables.itemsByServiceAndDataTypeID,
    isSubmittingIngestionRun: state.runs.isSubmittingIngestionRun
});

const mapDispatchToProps = dispatch => ({
    submitIngestionWorkflowRun: async (sID, dID, workflow, inputs, redirect, history) =>
        await dispatch(submitIngestionWorkflowRun(sID, dID, workflow, inputs, redirect, history))
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ManagerIngestionContent));
