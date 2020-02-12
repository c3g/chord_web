import React, {Component} from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";

import {Redirect, Route, Switch} from "react-router-dom";

import {Menu} from "antd";
import "antd/es/menu/style/css";

import ManagerProjectDatasetContent from "./manager/projects/ManagerProjectDatasetContent";
import ManagerAccessContent from "./manager/ManagerAccessContent";
import ManagerFilesContent from "./manager/ManagerFilesContent";
import ManagerIngestionContent from "./manager/ManagerIngestionContent";
import ManagerWorkflowsContent from "./manager/ManagerWorkflowsContent";
import ManagerRunsContent from "./manager/runs/ManagerRunsContent";

import {
    renderMenuItem,
    matchingMenuKeys,
    projectPropTypesShape,
    nodeInfoDataPropTypesShape,
    urlPath,
    withBasePath
} from "../utils";
import SitePageHeader from "./SitePageHeader";

const PAGE_MENU = [
    {url: withBasePath("data/manager/projects"), style: {marginLeft: "4px"}, text: "Projects and Datasets"},
    // {url: "/data/manager/access", text: "Access Management"},  // TODO: Re-enable for v0.2
    {url: withBasePath("data/manager/files"), text: "Files"},
    {url: withBasePath("data/manager/ingestion"), text: "Ingestion"},
    {url: withBasePath("data/manager/workflows"), text: "Workflows"},
    {url: withBasePath("data/manager/runs"), text: "Workflow Runs"},
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
        if (!this.props.nodeInfo.CHORD_URL) return null;
        const selectedKeys = matchingMenuKeys(PAGE_MENU, urlPath(this.props.nodeInfo.CHORD_URL));
        return (
            <>
                <SitePageHeader title="Data Manager"
                                subTitle="Share data with the CHORD federation"
                                style={{borderBottom: "none", paddingBottom: "0"}}
                                footer={
                                    <Menu mode="horizontal" style={MENU_STYLE} selectedKeys={selectedKeys}>
                                        {PAGE_MENU.map(renderMenuItem)}
                                    </Menu>
                                } />
                <Switch>
                    <Route path={withBasePath("data/manager/projects")}
                           component={ManagerProjectDatasetContent} />
                    <Route exact path={withBasePath("data/manager/access")} component={ManagerAccessContent} />
                    <Route exact path={withBasePath("data/manager/files")} component={ManagerFilesContent} />
                    <Route exact path={withBasePath("data/manager/ingestion")}
                           component={ManagerIngestionContent} />
                    <Route exact path={withBasePath("data/manager/workflows")}
                           component={ManagerWorkflowsContent} />
                    <Route path={withBasePath("data/manager/runs")} component={ManagerRunsContent} />
                    <Redirect from={withBasePath("data/manager")}
                              to={withBasePath("data/manager/projects")} />
                </Switch>
            </>
        );
    }
}

DataManagerContent.propTypes = {
    nodeInfo: nodeInfoDataPropTypesShape,
    projects: PropTypes.arrayOf(projectPropTypesShape),
    runs: PropTypes.arrayOf(PropTypes.shape({
        run_id: PropTypes.string,
        state: PropTypes.string
    }))
};

const mapStateToProps = state => ({
    nodeInfo: state.nodeInfo.data,
});

export default connect(mapStateToProps)(DataManagerContent);
