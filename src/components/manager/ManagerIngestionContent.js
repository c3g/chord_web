import React, {Component} from "react";
import {connect} from "react-redux";

import {Layout, List, Skeleton, Spin, Steps} from "antd";

import "antd/es/layout/style/css";
import "antd/es/list/style/css";
import "antd/es/skeleton/style/css";
import "antd/es/spin/style/css";
import "antd/es/steps/style/css";

import WorkflowListItem from "./WorkflowListItem";

import {workflowsStateToPropsMixin, workflowsStateToPropsMixinPropTypes} from "../../utils";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";

class ManagerIngestionContent extends Component {
    render() {
        const workflows = this.props.workflows.map(w => (
            <List.Item key={w.name}><WorkflowListItem key={w.name} workflow={w} selectable={true} /></List.Item>
        ));  // TODO: real key;
        return (
            <Layout>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    <Steps current={0}>
                        <Steps.Step title="Ingestion Workflow"
                                    description={`Choose a relevant ingestion workflow.`} />
                        <Steps.Step title="Input"
                                    description="Select input data for the workflow." />
                        <Steps.Step title="Run" description="Confirm details and run the workflow." />
                    </Steps>
                    <div style={{marginTop: "16px"}}>
                        <Spin spinning={this.props.workflowsLoading}>
                            {this.props.workflowsLoading
                                ? <Skeleton />
                                : <List itemLayout="vertical">{workflows}</List>}
                        </Spin>
                    </div>
                </Layout.Content>
            </Layout>
        )
    }
}

ManagerIngestionContent.propTypes = {
    ...workflowsStateToPropsMixinPropTypes
};

const mapStateToProps = state => ({...workflowsStateToPropsMixin(state)});

export default connect(mapStateToProps)(ManagerIngestionContent);
