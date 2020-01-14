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

import {renderMenuItem, matchingMenuKeys, projectPropTypesShape} from "../utils";

const PAGE_MENU = [
    {url: "/data/manager/projects", style: {marginLeft: "4px"}, text: "Projects and Datasets"},
    {url: "/data/manager/access", text: "Access Management"},
    {url: "/data/manager/files", text: "Files"},
    {url: "/data/manager/ingestion", text: "Ingestion"},
    {url: "/data/manager/workflows", text: "Workflows"},
    {url: "/data/manager/runs", text: "Workflow Runs"},
];

const MENU_STYLE = {
    marginLeft: "-24px",
    marginRight: "-24px",
    marginTop: "-12px"
};


class DataManagerContent extends Component {
    async componentDidMount() {
        document.title = "CHORD - Manage Your Data";
    }

    render() {
        const selectedKeys = matchingMenuKeys(PAGE_MENU, this.props.location);
        return (
            <>
                <PageHeader title={<div style={PAGE_HEADER_TITLE_STYLE}>Data Manager</div>}
                            subTitle={
                                <span style={PAGE_HEADER_SUBTITLE_STYLE}>Share data with the CHORD federation</span>}
                            style={{...PAGE_HEADER_STYLE, borderBottom: "none", paddingBottom: "0"}}
                            footer={
                                <Menu mode="horizontal" style={MENU_STYLE} selectedKeys={selectedKeys}>
                                    {PAGE_MENU.map(renderMenuItem)}
                                </Menu>
                            } />
                <Switch>
                    <Route path="/data/manager/projects" component={ManagerProjectDatasetContent} />
                    <Route exact path="/data/manager/access" component={ManagerAccessContent} />
                    <Route exact path="/data/manager/files" component={ManagerFilesContent} />
                    <Route exact path="/data/manager/ingestion" component={ManagerIngestionContent} />
                    <Route exact path="/data/manager/workflows" component={ManagerWorkflowsContent} />
                    <Route path="/data/manager/runs" component={ManagerRunsContent} />
                    <Redirect from="/data/manager" to="/data/manager/projects" />
                </Switch>
            </>
        );
    }
}

DataManagerContent.propTypes = {
    projects: PropTypes.arrayOf(projectPropTypesShape),
    runs: PropTypes.arrayOf(PropTypes.shape({
        run_id: PropTypes.string,
        state: PropTypes.string
    }))
};

export default connect()(DataManagerContent);
