import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Icon, Layout, List, Tag, Typography} from "antd";

import "antd/es/icon/style/css";
import "antd/es/layout/style/css";
import "antd/es/list/style/css";
import "antd/es/tag/style/css";
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
                    <List itemLayout="vertical">{workflows}</List>
                </Layout.Content>
            </Layout>
        );
    }
}

ManagerWorkflowsContent.propTypes = {
    workflows: PropTypes.arrayOf(PropTypes.object)
};

const mapStateToProps = state => ({
    workflows: Object.entries(state.serviceWorkflows.workflowsByServiceID)
        .filter(([_, s]) => !s.isFetching)
        .flatMap(([_, s]) => Object.entries(s.workflows.ingestion).map(w => w[1]))
});

export default connect(mapStateToProps)(ManagerWorkflowsContent);
