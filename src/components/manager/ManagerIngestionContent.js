import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Layout, Steps} from "antd";

import "antd/es/layout/style/css";
import "antd/es/steps/style/css";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";
import {workflowsStateToPropsMixin} from "../../utils";

class ManagerIngestionContent extends Component {
    render() {
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
                </Layout.Content>
            </Layout>
        )
    }
}

const mapStateToProps = state => ({...workflowsStateToPropsMixin(state)});

export default connect(mapStateToProps)(ManagerIngestionContent);
