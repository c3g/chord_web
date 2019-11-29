import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Link, Redirect, Route, Switch} from "react-router-dom";

import {Menu, PageHeader} from "antd";

import "antd/es/menu/style/css";
import "antd/es/page-header/style/css";

import ManagerProjectDatasetContent from "./manager/projects/ManagerProjectDatasetContent";
import ManagerAccessContent from "./manager/ManagerAccessContent";
import ManagerFilesContent from "./manager/ManagerFilesContent";
import ManagerIngestionContent from "./manager/ManagerIngestionContent";
import ManagerWorkflowsContent from "./manager/ManagerWorkflowsContent";
import ManagerRunsContent from "./manager/runs/ManagerRunsContent";

import {PAGE_HEADER_STYLE, PAGE_HEADER_TITLE_STYLE, PAGE_HEADER_SUBTITLE_STYLE} from "../styles/pageHeader";

const renderContent = Content => route => (
    <>
        <PageHeader title={<div style={PAGE_HEADER_TITLE_STYLE}>Data Manager</div>}
                    subTitle={<span style={PAGE_HEADER_SUBTITLE_STYLE}>
                                Share data with the CHORD federation
                            </span>}
                    style={{...PAGE_HEADER_STYLE, borderBottom: "none", paddingBottom: "0"}}
                    footer={
                        <Menu mode="horizontal" style={{
                            marginLeft: "-24px",
                            marginRight: "-24px",
                            marginTop: "-12px"
                        }} selectedKeys={[route.match.path]}>
                            <Menu.Item key="/data/manager/projects" style={{marginLeft: "4px"}}>
                                <Link to="/data/manager/projects">Projects and Datasets</Link>
                            </Menu.Item>
                            <Menu.Item key="/data/manager/access">
                                <Link to="/data/manager/access">Access Management</Link>
                            </Menu.Item>
                            <Menu.Item key="/data/manager/files">
                                <Link to="/data/manager/files">Files</Link>
                            </Menu.Item>
                            <Menu.Item key="/data/manager/ingestion">
                                <Link to="/data/manager/ingestion">Ingestion</Link>
                            </Menu.Item>
                            <Menu.Item key="/data/manager/workflows">
                                <Link to="/data/manager/workflows">Workflows</Link>
                            </Menu.Item>
                            <Menu.Item key="/data/manager/runs">
                                <Link to="/data/manager/runs">Workflow Runs</Link>
                            </Menu.Item>
                        </Menu>
                    } />
        <Content />
    </>
);

class DataManagerContent extends Component {
    async componentDidMount() {
        document.title = "CHORD - Manage Your Data";
    }

    render() {
        return (
            <Switch>
                <Route exact path="/data/manager/projects" component={renderContent(ManagerProjectDatasetContent)} />
                <Route exact path="/data/manager/access" component={renderContent(ManagerAccessContent)} />
                <Route exact path="/data/manager/files" component={renderContent(ManagerFilesContent)} />
                <Route exact path="/data/manager/ingestion" component={renderContent(ManagerIngestionContent)} />
                <Route exact path="/data/manager/workflows" component={renderContent(ManagerWorkflowsContent)} />
                <Route path="/data/manager/runs" component={renderContent(ManagerRunsContent)} />
                <Redirect from="/data/manager" to="/data/manager/projects" />
            </Switch>
        );
    }
}

DataManagerContent.propTypes = {
    runs: PropTypes.arrayOf(PropTypes.shape({
        run_id: PropTypes.string,
        state: PropTypes.string
    }))
};

export default connect()(DataManagerContent);
