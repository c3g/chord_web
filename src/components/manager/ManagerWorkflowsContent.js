import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Layout, List, Skeleton, Spin, Typography} from "antd";

import "antd/es/layout/style/css";
import "antd/es/list/style/css";
import "antd/es/skeleton/style/css";
import "antd/es/spin/style/css";
import "antd/es/typography/style/css";

import WorkflowListItem from "./WorkflowListItem";

import {LAYOUT_CONTENT_STYLE} from "../../styles/layoutContent";

class ManagerWorkflowsContent extends Component {
    render() {
        const workflows = this.props.workflows.map(w => (
            <List.Item key={w.name}><WorkflowListItem key={w.name} workflow={w} /></List.Item>
        ));  // TODO: real key
        return (
            <Layout>
                <Layout.Content style={LAYOUT_CONTENT_STYLE}>
                    <Typography.Title level={2}>Ingestion Workflows</Typography.Title>
                    <Spin spinning={this.props.loading}>
                        {this.props.loading ? <Skeleton /> : <List itemLayout="vertical">{workflows}</List>}
                    </Spin>
                </Layout.Content>
            </Layout>
        );
    }
}

ManagerWorkflowsContent.propTypes = {
    workflows: PropTypes.arrayOf(PropTypes.object),
    loading: PropTypes.bool
};

const mapStateToProps = state => ({
    workflows: Object.entries(state.serviceWorkflows.workflowsByServiceID)
        .filter(([_, s]) => !s.isFetching)
        .flatMap(([_, s]) => Object.entries(s.workflows.ingestion).map(w => w[1])),
    loading: state.services.isFetchingAll || state.serviceWorkflows.isFetchingAll
});

export default connect(mapStateToProps)(ManagerWorkflowsContent);
