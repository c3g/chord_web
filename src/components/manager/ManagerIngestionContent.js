import React, {Component} from "react";
import {connect} from "react-redux";

import {Button, Layout, List, Skeleton, Spin, Steps, Typography} from "antd";

import "antd/es/button/style/css";
import "antd/es/layout/style/css";
import "antd/es/list/style/css";
import "antd/es/skeleton/style/css";
import "antd/es/spin/style/css";
import "antd/es/steps/style/css";
import "antd/es/typography/style/css";

import WorkflowListItem from "./WorkflowListItem";

import {
    dropBoxTreeStateToPropsMixin,
    dropBoxTreeStateToPropsMixinPropTypes,

    workflowsStateToPropsMixin,
    workflowsStateToPropsMixinPropTypes
} from "../../utils";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";
import IngestionInputForm from "./IngestionInputForm";

class ManagerIngestionContent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            step: 0,
            selectedWorkflow: null,
            inputFormFields: {},
            inputs: {}
        };

        this.handleStepChange = this.handleStepChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleInputSubmit = this.handleInputSubmit.bind(this);
    }

    handleStepChange(step) {
        this.setState({step});
    }

    handleClick(workflow) {
        this.setState({
            step: 1,
            selectedWorkflow: workflow,
            inputFormFields: {},
            inputs: {}
        });
    }

    handleInputSubmit(inputs) {
        this.setState({
            inputs,
            step: 2
        });
    }

    render() {
        let stepContents = null;
        switch (this.state.step) {
            case 0:
                const workflows = this.props.workflows.map(w => (
                    <List.Item key={w.name}>
                        <WorkflowListItem key={w.name} workflow={w} selectable={true}
                                          onClick={() => this.handleClick(w)} />
                    </List.Item>
                ));  // TODO: real key

                stepContents = (
                    <Spin spinning={this.props.workflowsLoading}>
                        {this.props.workflowsLoading
                            ? <Skeleton />
                            : <List itemLayout="vertical">{workflows}</List>}
                    </Spin>
                );

                break;

            case 1:
                stepContents = (
                    <IngestionInputForm workflow={this.state.selectedWorkflow} tree={this.props.tree}
                                        formValues={this.state.inputFormFields}
                                        onChange={formValues => this.setState({inputFormFields: formValues})}
                                        onSubmit={this.handleInputSubmit}
                                        onBack={() => this.handleStepChange(0)} />
                    );
                break;

            case 2:
                stepContents = (
                    <>
                        <Typography.Title level={2}>Workflow</Typography.Title>
                        <List itemLayout="vertical" style={{marginBottom: "14px"}}>
                            <List.Item>
                                <WorkflowListItem workflow={this.state.selectedWorkflow} />
                            </List.Item>
                        </List>
                        <Typography.Title level={2}>Inputs</Typography.Title>
                        <Typography.Paragraph>
                            {this.state.selectedWorkflow.inputs.map(i => <div key={i.id}>
                                <span style={{fontWeight: "bold", marginRight: "0.5em"}}>{i.id}:</span>
                                {this.state.inputs[i.id]}
                            </div>)}
                        </Typography.Paragraph>
                        <Button type="primary" style={{marginTop: "16px"}}>Run Ingestion</Button>
                    </>
                );
                break;
        }

        return (
            <Layout>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    <Steps current={this.state.step} onChange={this.handleStepChange}>
                        <Steps.Step title="Workflow"
                                    description={`Choose a relevant ingestion workflow.`}>

                        </Steps.Step>
                        <Steps.Step title="Input"
                                    description="Select input data for the workflow."
                                    disabled={this.state.step < 1 && Object.keys(this.state.inputs).length === 0} />
                        <Steps.Step title="Run" description="Confirm details and run the workflow."
                                    disabled={this.state.step < 2 && (this.state.selectedWorkflow === null ||
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
    ...workflowsStateToPropsMixinPropTypes
};

const mapStateToProps = state => ({
    ...dropBoxTreeStateToPropsMixin(state),
    ...workflowsStateToPropsMixin(state)
});

export default connect(mapStateToProps)(ManagerIngestionContent);
