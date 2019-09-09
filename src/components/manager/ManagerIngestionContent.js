import React, {Component} from "react";
import {connect} from "react-redux";

import {Layout, List, Skeleton, Spin, Steps} from "antd";

import "antd/es/layout/style/css";
import "antd/es/list/style/css";
import "antd/es/skeleton/style/css";
import "antd/es/spin/style/css";
import "antd/es/steps/style/css";

import WorkflowListItem from "./WorkflowListItem";

import {
    dropBoxTreeStateToPropsMixin,
    dropBoxTreeStateToPropsMixinPropTypes,

    workflowsStateToPropsMixin,
    workflowsStateToPropsMixinPropTypes
} from "../../utils";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";

class ManagerIngestionContent extends Component {
    constructor(props) {
        super(props);

        this.state = {
            step: 0,
            selectedWorkflow: null
        };

        this.handleStepChange = this.handleStepChange.bind(this);
    }

    handleClick(workflow) {
        this.setState({
            selectedWorkflow: workflow.name,
            step: 1
        });
    }

    handleStepChange(step) {
        this.setState({step});
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
                stepContents = (<div>step 2</div>);
                break;

            case 2:
                stepContents = (<div>step 3</div>);
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
                                    disabled={this.state.step < 1} />
                        <Steps.Step title="Run" description="Confirm details and run the workflow."
                                    disabled={this.state.step < 2} />
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
