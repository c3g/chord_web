import React, {Component} from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import PropTypes from "prop-types";

import {Button, Empty, Form, Layout, List, Select, Skeleton, Spin, Steps, Table, Tag} from "antd";

import "antd/es/button/style/css";
import "antd/es/empty/style/css";
import "antd/es/form/style/css";
import "antd/es/layout/style/css";
import "antd/es/list/style/css";
import "antd/es/select/style/css";
import "antd/es/skeleton/style/css";
import "antd/es/spin/style/css";
import "antd/es/steps/style/css";
import "antd/es/table/style/css";
import "antd/es/tag/style/css";

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
            selectedDataset: null,
            selectedWorkflow: null,
            inputFormFields: {},
            inputs: {}
        };

        // TODO: Move selectedDataset to redux?

        this.state = {
            ...simpleDeepCopy(this.initialState),
            selectedDataset: (this.props.location.state || {}).selectedDataset || this.initialState.selectedDataset
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
        if (!this.state.selectedDataset || !this.state.selectedWorkflow) {
            // TODO: GUI error message
            return;
        }

        const datasetID = this.state.selectedDataset.split(":")[1];

        await this.props.submitIngestionWorkflowRun(this.state.selectedWorkflow.serviceID, datasetID,
            this.state.selectedWorkflow, this.state.inputs, "/data/manager/runs", history);

        this.setState(simpleDeepCopy(this.initialState));
    }

    render() {
        const getDatasetName = (serviceID, dataTypeID, datasetID) =>
            ((((this.props.datasetsByServiceAndDataTypeID[serviceID] || {})[dataTypeID]
                || {}).datasetsByID || {})[datasetID] || {}).name;

        let stepContents = null;
        switch (this.state.step) {
            case STEP_WORKFLOW_SELECTION:
                // TODO: Loading projects

                const datasetsByID = Object.fromEntries(this.props.projects.flatMap(p =>
                    (this.props.projectDatasets[p.id] || []).map(d => [d.dataset_id, d])));

                const selectContents = this.props.projects.map(p => (
                    <Select.OptGroup key={p.id} label={p.name}>
                        {(this.props.projectDatasets[p.id] || []).map(d => (
                            <Select.Option key={`${p.id}:${d.dataset_id}`} value={`${p.id}:${d.dataset_id}`}>
                                <Tag style={{marginRight: "1em"}}>{d.data_type_id}</Tag>
                                {getDatasetName(d.service_id, d.data_type_id, d.dataset_id)
                                    ? `${getDatasetName(d.service_id, d.data_type_id, d.dataset_id)} (${d.dataset_id})`
                                    : d.dataset_id}
                            </Select.Option>
                        ))}
                    </Select.OptGroup>
                ));

                const workflows = this.props.workflows
                    .filter(w => w.data_types.includes(
                        (datasetsByID[this.state.selectedDataset ? this.state.selectedDataset.split(":")[1] : null]
                            || {data_type_id: null}).data_type_id))
                    .map(w => (
                        <List.Item key={w.id}>
                            <WorkflowListItem key={w.id} workflow={w} selectable={true}
                                              onClick={() => this.handleWorkflowClick(w)} />
                        </List.Item>
                    ));

                stepContents = (
                    <Form labelCol={FORM_LABEL_COL} wrapperCol={FORM_WRAPPER_COL}>
                        <Form.Item label="Dataset">
                            <Select onChange={dataset => this.setState({selectedDataset: dataset})}
                                    value={this.state.selectedDataset}>{selectContents}</Select>
                        </Form.Item>
                        <Form.Item label="Workflows">
                            {this.state.selectedDataset
                                ? <Spin spinning={this.props.workflowsLoading}>
                                    {this.props.workflowsLoading
                                        ? <Skeleton/>
                                        : <List itemLayout="vertical">{workflows}</List>}
                                </Spin>
                                : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}
                                         description="Select a dataset to see available workflows" />
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
                const [projectID, datasetID] = this.state.selectedDataset.split(":");
                const projectName = (this.props.projectsByID[projectID] || {name: null}).name || null;
                const datasetName = getDatasetName(this.state.selectedWorkflow.serviceID,
                    this.state.selectedWorkflow.data_types[0], datasetID);
                stepContents = (
                    <Form labelCol={FORM_LABEL_COL} wrapperCol={FORM_WRAPPER_COL}>
                        <Form.Item label="Project">
                            {projectName ? `${projectName} (${projectID})` : projectID}
                        </Form.Item>
                        <Form.Item label="Dataset">
                            {datasetName ? `${datasetName} (${datasetID})` : datasetID}
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
                        <Steps.Step title="Dataset & Workflow"
                                    description={<span style={{letterSpacing: "-0.1px"}}>
                                        Choose a dataset and ingestion workflow.
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
    projectDatasets: PropTypes.object,  // TODO: Shape
    isSubmittingIngestionRun: PropTypes.bool
};

const mapStateToProps = state => ({
    ...dropBoxTreeStateToPropsMixin(state),
    ...workflowsStateToPropsMixin(state),
    projects: state.projects.items,
    projectsByID: state.projects.itemsByID,
    projectDatasets: state.projectDatasets.itemsByProjectID,
    datasetsByServiceAndDataTypeID: state.serviceDatasets.datasetsByServiceAndDataTypeID,
    isSubmittingIngestionRun: state.runs.isSubmittingIngestionRun
});

const mapDispatchToProps = dispatch => ({
    submitIngestionWorkflowRun: async (sID, dID, workflow, inputs, redirect, history) =>
        await dispatch(submitIngestionWorkflowRun(sID, dID, workflow, inputs, redirect, history))
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ManagerIngestionContent));
